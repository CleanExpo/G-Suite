/**
 * API Keys Management
 *
 * POST   /api/keys - Create a new API key
 * GET    /api/keys - List user's API keys
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateApiKey } from '@/lib/gateway/api-key-auth';
import prisma from '@/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/keys - Create a new API key
 *
 * Body:
 * - name: string (required) - Human-readable key name
 * - scopes: string[] (optional) - Array of scopes (defaults to ["missions:read", "agents:read"])
 * - tier: string (optional) - Rate limit tier (defaults to "standard")
 * - expiresInDays: number (optional) - Expiry in days (null = no expiry)
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
    const {
      name,
      scopes = ['missions:read', 'agents:read'],
      tier = 'standard',
      expiresInDays,
    } = body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Name is required',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 },
      );
    }

    // Generate API key
    const { key, hash, prefix } = generateApiKey();

    // Calculate expiry date
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash: hash,
        keyPrefix: prefix,
        scopes: scopes || [],
        userId,
        rateLimitTier: tier,
        expiresAt,
      },
    });

    // Return key ONCE (never stored in plaintext)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: apiKey.id,
          key, // ⚠️ SHOWN ONLY ONCE
          prefix: apiKey.keyPrefix,
          name: apiKey.name,
          scopes: apiKey.scopes,
          tier: apiKey.rateLimitTier,
          expiresAt: apiKey.expiresAt?.toISOString() || null,
          createdAt: apiKey.createdAt.toISOString(),
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
          warning: 'Save this key securely. It will not be shown again.',
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('[API Keys] Error creating key:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create API key',
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
 * GET /api/keys - List user's API keys
 *
 * Returns all API keys for the authenticated user (without plaintext keys).
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
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        rateLimitTier: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        keys: keys.map((key) => ({
          ...key,
          lastUsedAt: key.lastUsedAt?.toISOString() || null,
          expiresAt: key.expiresAt?.toISOString() || null,
          createdAt: key.createdAt.toISOString(),
          updatedAt: key.updatedAt.toISOString(),
        })),
        total: keys.length,
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Keys] Error listing keys:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list API keys',
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
