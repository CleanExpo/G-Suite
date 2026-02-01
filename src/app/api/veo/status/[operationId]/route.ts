/**
 * Veo 3.1 Operation Status API Endpoint
 *
 * GET /api/veo/status/[operationId]
 *
 * Check the status of a video generation operation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getVeoClient } from '@/lib/google/veo-client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    operationId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    // Await params (Next.js 15+ requirement)
    const { operationId } = await params;

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

    if (!operationId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing operation ID',
          },
        },
        { status: 400 },
      );
    }

    console.log(
      `[GET /api/veo/status/${operationId}] Checking operation status for user ${userId}`,
    );

    // Check if Google Cloud is configured
    const hasGoogleCloud =
      process.env.GOOGLE_CLOUD_PROJECT &&
      process.env.GOOGLE_CLOUD_PROJECT !== 'your-project-id-here';

    if (!hasGoogleCloud) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message:
              'Google Cloud not configured. Set GOOGLE_CLOUD_PROJECT in environment variables.',
          },
        },
        { status: 503 },
      );
    }

    // Get Veo client
    const veoClient = getVeoClient();

    // Decode operation name from operation ID
    // The full operation name format: projects/{project}/locations/{location}/publishers/google/models/{model}/operations/{operationId}
    const operationName = decodeURIComponent(operationId);

    // Get operation status
    const status = await veoClient.getOperationStatus(operationName);

    // Return status
    return NextResponse.json({
      success: true,
      data: {
        operationName: status.name,
        done: status.done,
        videoUrls: status.done && !status.error ? extractVideoUrls(status) : undefined,
        metadata: status.metadata,
        error: status.error
          ? {
              code: status.error.code,
              message: status.error.message,
            }
          : undefined,
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[GET /api/veo/status] Error:', error);

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

// Helper function to extract video URLs from operation response
function extractVideoUrls(status: any): string[] {
  if (!status.response?.predictions) {
    return [];
  }

  const urls: string[] = [];

  for (const prediction of status.response.predictions) {
    if (prediction.gcsUri) {
      urls.push(prediction.gcsUri);
    } else if (prediction.bytesBase64Encoded) {
      urls.push(`data:video/mp4;base64,${prediction.bytesBase64Encoded}`);
    }
  }

  return urls;
}
