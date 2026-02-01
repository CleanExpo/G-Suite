/**
 * Webhooks API
 *
 * POST /api/webhooks - Create a new webhook endpoint
 * GET  /api/webhooks - List user's webhook endpoints
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createWebhookEndpoint, listWebhookEndpoints } from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks - Create a new webhook endpoint
 *
 * Body:
 * - url: string (required) - Target URL for webhook delivery
 * - events: string[] (required) - Event types to subscribe to
 * - secret: string (optional) - Custom secret (auto-generated if not provided)
 * - metadata: object (optional) - Additional metadata
 */
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { url, events, secret, metadata } = body;

    // Validate required fields
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'URL is required',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'At least one event type is required',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Create webhook endpoint
    const { endpoint, secret: generatedSecret } = await createWebhookEndpoint(userId, {
      url,
      events,
      secret,
      metadata,
    });

    // Return endpoint with secret (shown once)
    return NextResponse.json(
      {
        success: true,
        data: {
          ...endpoint,
          secret: generatedSecret, // ⚠️ SHOWN ONLY ONCE
          createdAt: endpoint.createdAt.toISOString(),
          updatedAt: endpoint.updatedAt.toISOString(),
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
          warning:
            'Save this secret securely. It will not be shown again. Use it to verify webhook signatures.',
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('[Webhooks API] Error creating webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create webhook',
          details: error.message,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/webhooks - List user's webhook endpoints
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 401 },
    );
  }

  try {
    const endpoints = await listWebhookEndpoints(userId);

    return NextResponse.json({
      success: true,
      data: {
        webhooks: endpoints.map((endpoint) => ({
          ...endpoint,
          createdAt: endpoint.createdAt.toISOString(),
          updatedAt: endpoint.updatedAt.toISOString(),
        })),
        total: endpoints.length,
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Webhooks API] Error listing webhooks:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list webhooks',
          details: error.message,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
