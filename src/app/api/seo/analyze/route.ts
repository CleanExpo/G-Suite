/**
 * SEO Analysis API Endpoint
 *
 * POST /api/seo/analyze
 *
 * Performs comprehensive SEO analysis on a given URL or HTML content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSEOEngine } from '@/lib/seo/engine';
import type { SEOAnalysisRequest } from '@/lib/seo/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for comprehensive analysis

interface AnalyzeRequest {
  url: string;
  html?: string;
  keywords?: string[];
  includePerformance?: boolean;
  includeBacklinks?: boolean;
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
    const body: AnalyzeRequest = await request.json();

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required field: url',
          },
        },
        { status: 400 },
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Invalid URL format',
          },
        },
        { status: 400 },
      );
    }

    console.log(`[POST /api/seo/analyze] User ${userId} analyzing ${body.url}`);
    console.log(`[POST /api/seo/analyze] Keywords: ${body.keywords?.join(', ') || 'none'}`);
    console.log(`[POST /api/seo/analyze] Include performance: ${body.includePerformance || false}`);

    // Get SEO engine
    const engine = getSEOEngine();

    // Prepare analysis request
    const analysisRequest: SEOAnalysisRequest = {
      url: body.url,
      html: body.html,
      keywords: body.keywords || [],
      includePerformance: body.includePerformance || false,
      includeBacklinks: body.includeBacklinks || false,
    };

    // Perform analysis
    const startTime = Date.now();
    const result = await engine.analyze(analysisRequest);
    const duration = Date.now() - startTime;

    console.log(`[POST /api/seo/analyze] Analysis completed in ${duration}ms`);
    console.log(`[POST /api/seo/analyze] Overall score: ${result.overallScore}/100`);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        analyzedAt: result.analyzedAt.toISOString(),
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        userId,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/seo/analyze] Error:', error);

    // Handle specific errors
    if (error.message?.includes('Failed to fetch')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch URL. Please check if the URL is accessible.',
            details: error.message,
          },
        },
        { status: 400 },
      );
    }

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
