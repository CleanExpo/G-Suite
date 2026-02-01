/**
 * Social Media Publishing API Endpoint
 *
 * POST /api/social/publish
 *
 * Publish content to social media platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSocialMediaManager } from '@/lib/social-media/manager';
import type { PublishOptions } from '@/lib/social-media/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute max execution time

interface PublishRequest {
  platform: PublishOptions['platform'];
  accountId: string;
  content: PublishOptions['content'];
  postType: PublishOptions['postType'];
  scheduledTime?: string; // ISO 8601 date string
  credentials: Record<string, unknown>; // Platform-specific credentials
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body: PublishRequest = await request.json();

    // Validate required fields
    if (!body.platform) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: platform',
          },
        },
        { status: 400 },
      );
    }

    if (!body.accountId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: accountId',
          },
        },
        { status: 400 },
      );
    }

    if (!body.content || !body.content.text) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: content.text',
          },
        },
        { status: 400 },
      );
    }

    if (!body.postType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: postType',
          },
        },
        { status: 400 },
      );
    }

    if (!body.credentials) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: credentials',
          },
        },
        { status: 400 },
      );
    }

    console.log(`[POST /api/social/publish] User ${userId} publishing to ${body.platform}`);
    console.log(`[POST /api/social/publish] Post type: ${body.postType}`);
    console.log(`[POST /api/social/publish] Content length: ${body.content.text.length} chars`);

    // Get social media manager
    const manager = getSocialMediaManager();

    // Check if platform is supported
    if (!manager.isPlatformSupported(body.platform)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PLATFORM_NOT_SUPPORTED',
            message: `Platform "${body.platform}" is not yet supported`,
            details: {
              supportedPlatforms: manager.getSupportedPlatforms(),
            },
          },
        },
        { status: 400 },
      );
    }

    // Validate content before publishing
    const validation = manager.validateContent(body.platform, body.content, body.postType);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Content validation failed',
            details: {
              errors: validation.errors,
              warnings: validation.warnings,
            },
          },
        },
        { status: 400 },
      );
    }

    // Publish content
    const publishOptions: PublishOptions = {
      platform: body.platform,
      accountId: body.accountId,
      content: body.content,
      postType: body.postType,
      scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : undefined,
      platformSpecific: {
        credentials: body.credentials,
      },
    };

    const result = await manager.publish(publishOptions);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: result.error?.code || 'PUBLISH_FAILED',
            message: result.error?.message || 'Failed to publish content',
            details: result.error?.details,
          },
        },
        { status: 500 },
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        platform: result.platform,
        postId: result.postId,
        postUrl: result.postUrl,
        scheduledFor: result.scheduledFor,
        metadata: result.metadata,
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[POST /api/social/publish] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
