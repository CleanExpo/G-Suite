/**
 * Veo 3.1 Video Generation API Endpoint
 *
 * POST /api/veo/generate
 *
 * Handles async video generation using Google Veo 3.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { veo31Generate } from '@/tools/googleAPISkills';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time

interface GenerateVideoRequest {
  prompt: string;
  duration?: 4 | 6 | 8;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  referenceImage?: {
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  };
  referenceImages?: Array<{
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
    referenceType: 'asset' | 'style';
  }>;
  negativePrompt?: string;
  seed?: number;
  personGeneration?: 'allow_adult' | 'dont_allow' | 'allow_all';
  generateAudio?: boolean;
  waitForCompletion?: boolean; // Default: true
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
    const body: GenerateVideoRequest = await request.json();

    // Validate required fields
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing or invalid required field: prompt',
          },
        },
        { status: 400 },
      );
    }

    if (body.prompt.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Prompt must be at least 10 characters long',
          },
        },
        { status: 400 },
      );
    }

    // Validate duration
    if (body.duration && ![4, 6, 8].includes(body.duration)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Duration must be 4, 6, or 8 seconds',
          },
        },
        { status: 400 },
      );
    }

    // Validate resolution
    if (body.resolution && !['720p', '1080p', '4k'].includes(body.resolution)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Resolution must be 720p, 1080p, or 4k',
          },
        },
        { status: 400 },
      );
    }

    // Validate aspect ratio
    if (body.aspectRatio && !['16:9', '9:16', '1:1'].includes(body.aspectRatio)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Aspect ratio must be 16:9, 9:16, or 1:1',
          },
        },
        { status: 400 },
      );
    }

    console.log(`[POST /api/veo/generate] User ${userId} requesting video generation`);
    console.log(`[POST /api/veo/generate] Prompt: "${body.prompt.substring(0, 100)}..."`);
    console.log(
      `[POST /api/veo/generate] Duration: ${body.duration || 8}s, Resolution: ${body.resolution || '720p'}`,
    );

    // Generate video
    const result = await veo31Generate(userId, body.prompt, {
      duration: body.duration,
      resolution: body.resolution,
      aspectRatio: body.aspectRatio,
      referenceImage: body.referenceImage,
      referenceImages: body.referenceImages,
      negativePrompt: body.negativePrompt,
      seed: body.seed,
      personGeneration: body.personGeneration,
      generateAudio: body.generateAudio,
      waitForCompletion: body.waitForCompletion !== undefined ? body.waitForCompletion : true,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: result.error || 'Video generation failed',
            details: {
              generationTime: result.generationTime,
            },
          },
        },
        { status: 500 },
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        videoUrl: result.videoUrl,
        operationName: result.operationName,
        metadata: {
          duration: result.duration,
          resolution: result.resolution,
          aspectRatio: result.aspectRatio,
          generationTime: result.generationTime,
          generatedAt: new Date().toISOString(),
        },
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[POST /api/veo/generate] Error:', error);

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
