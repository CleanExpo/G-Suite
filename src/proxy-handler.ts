/**
 * Next.js Proxy (Middleware)
 *
 * Handles session management, rate limiting, authentication, and CORS for all routes.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/session';
import { auth } from '@clerk/nextjs/server';
import {
  checkRateLimit,
  getRateLimitConfig,
  getRateLimitHeaders,
} from '@/lib/gateway/rate-limiter';
import { validateApiKey } from '@/lib/gateway/api-key-auth';
import type { RateLimitTier } from '@/lib/gateway/types';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── API Routes: Authentication & Rate Limiting ──────────────────────────

  if (pathname.startsWith('/api/')) {
    let userId: string | null = null;
    let tier: RateLimitTier = 'standard';
    let apiKeyScopes: string[] | undefined;
    let apiKeyPrefix: string | undefined;

    // ─── Public/Test endpoints (no auth required) ───────────────────────────
    const publicEndpoints = [
      '/api/webhooks',
      '/api/health',
      '/api/geo/test',
      '/api/geo/analyze',
      '/api/geo/rankings',
      '/api/geo/competitors',
    ];
    const isPublicEndpoint = publicEndpoints.some((ep) => pathname.startsWith(ep));

    if (isPublicEndpoint) {
      // Skip authentication for public endpoints
      return NextResponse.next();
    }

    // ─── API Key Authentication ────────────────────────────────────────────

    const apiKeyHeader = request.headers.get('x-api-key');

    if (apiKeyHeader) {
      // Authenticate with API key
      const validation = await validateApiKey(apiKeyHeader);

      if (validation.valid) {
        userId = validation.userId || null;
        tier = validation.tier || 'standard';
        apiKeyScopes = validation.scopes;
        apiKeyPrefix = validation.keyPrefix;

        // Store validated data in request headers for route handlers
        request.headers.set('x-user-id', userId || '');
        request.headers.set('x-api-scopes', JSON.stringify(apiKeyScopes || []));
        request.headers.set('x-api-key-prefix', apiKeyPrefix || '');
      } else {
        // Invalid API key
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_API_KEY',
              message: 'Invalid or expired API key',
            },
            meta: {
              version: 'v1',
              timestamp: new Date().toISOString(),
            },
          },
          { status: 401 },
        );
      }
    } else {
      // ─── Clerk Authentication (fallback) ────────────────────────────────
      try {
        const { userId: clerkUserId } = await auth();
        userId = clerkUserId;
      } catch (error) {
        // Clerk not configured - allow unauthenticated access for development
        console.warn('[Proxy] Clerk authentication failed, allowing unauthenticated access');
        userId = null;
      }
    }

    // ─── Rate Limiting ──────────────────────────────────────────────────────

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const identifier = userId || ip;

    // Check rate limit
    const rateLimitConfig = getRateLimitConfig(tier, identifier, pathname);
    const rateLimitResult = await checkRateLimit(rateLimitConfig);

    // If rate limit exceeded, return 429
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            details: {
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt.toISOString(),
            },
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        },
      );
    }

    // Add rate limit headers to successful response
    const response = NextResponse.next();
    const headers = getRateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // ─── Non-API Routes: Supabase Session Update ─────────────────────────────

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
