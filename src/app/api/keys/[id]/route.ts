/**
 * Individual API Key Management
 *
 * GET    /api/keys/:id - Get key details
 * DELETE /api/keys/:id - Revoke/delete key
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/keys/:id - Get API key details
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;

    const key = await prisma.apiKey.findFirst({
      where: {
        id,
        userId, // Ensure user owns the key
      },
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
    });

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...key,
        lastUsedAt: key.lastUsedAt?.toISOString() || null,
        expiresAt: key.expiresAt?.toISOString() || null,
        createdAt: key.createdAt.toISOString(),
        updatedAt: key.updatedAt.toISOString(),
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Keys] Error fetching key:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch API key',
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
 * DELETE /api/keys/:id - Revoke/delete API key
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;

    // Verify ownership before deletion
    const key = await prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 },
      );
    }

    // Delete the key
    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'API key revoked successfully',
        id,
        keyPrefix: key.keyPrefix,
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Keys] Error deleting key:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to revoke API key',
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
