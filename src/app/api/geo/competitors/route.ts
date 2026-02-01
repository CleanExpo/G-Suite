/**
 * Local Competitor Analysis API Endpoint
 *
 * POST /api/geo/competitors
 *
 * Analyzes local competitors to:
 * - Identify competitors in the same area
 * - Compare Google Business Profiles
 * - Identify citation gaps
 * - Compare reviews and ratings
 * - Find competitive opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLocalCompetitorAnalyzer } from '@/lib/geo/local-competitor-analyzer';
import type { CompetitorAnalysisInput } from '@/lib/geo/local-competitor-analyzer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
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
    const body = await req.json();

    // Validate required fields
    const validation = validateCompetitorRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: validation.error,
          },
        },
        { status: 400 },
      );
    }

    const input: CompetitorAnalysisInput = {
      businessName: body.businessName,
      address: body.address,
      categories: body.categories || [],
      lat: body.lat,
      lng: body.lng,
      radius: body.radius || 10,
      yourProfile: {
        rating: body.yourProfile?.rating || 0,
        reviewCount: body.yourProfile?.reviewCount || 0,
        citationCount: body.yourProfile?.citationCount || 0,
        photoCount: body.yourProfile?.photoCount || 0,
        postCount: body.yourProfile?.postCount || 0,
        completenessScore: body.yourProfile?.completenessScore || 0,
      },
      knownCompetitors: body.knownCompetitors,
    };

    console.log(
      `[POST /api/geo/competitors] Analyzing competitors for ${input.businessName} (user ${userId})`,
    );

    // Analyze competitors
    const analyzer = getLocalCompetitorAnalyzer();
    const analysis = await analyzer.analyze(input);

    return NextResponse.json({
      success: true,
      data: analysis,
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[POST /api/geo/competitors] Error:', error);

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

/**
 * Validate competitor analysis request
 */
function validateCompetitorRequest(body: any): { valid: boolean; error?: string } {
  if (!body.businessName) {
    return { valid: false, error: 'Missing required field: businessName' };
  }

  if (!body.address) {
    return { valid: false, error: 'Missing required field: address' };
  }

  if (!body.yourProfile) {
    return { valid: false, error: 'Missing required field: yourProfile' };
  }

  // Validate yourProfile has required fields
  const profile = body.yourProfile;
  if (typeof profile.rating !== 'number') {
    return { valid: false, error: 'yourProfile.rating must be a number' };
  }

  if (typeof profile.reviewCount !== 'number') {
    return { valid: false, error: 'yourProfile.reviewCount must be a number' };
  }

  if (typeof profile.citationCount !== 'number') {
    return { valid: false, error: 'yourProfile.citationCount must be a number' };
  }

  // Validate radius if provided
  if (body.radius !== undefined) {
    if (typeof body.radius !== 'number' || body.radius <= 0 || body.radius > 50) {
      return { valid: false, error: 'radius must be a number between 1 and 50 miles' };
    }
  }

  // Validate coordinates if provided
  if (body.lat !== undefined && (typeof body.lat !== 'number' || body.lat < -90 || body.lat > 90)) {
    return { valid: false, error: 'lat must be a number between -90 and 90' };
  }

  if (
    body.lng !== undefined &&
    (typeof body.lng !== 'number' || body.lng < -180 || body.lng > 180)
  ) {
    return { valid: false, error: 'lng must be a number between -180 and 180' };
  }

  return { valid: true };
}

/**
 * Get competitor analysis info
 */
export async function GET(req: NextRequest): Promise<Response> {
  return NextResponse.json({
    success: true,
    data: {
      name: 'Local Competitor Analysis API',
      version: 'v1',
      description: 'Analyzes local competitors and identifies opportunities',
      analysisFeatures: [
        'Identify local competitors in radius',
        'Compare Google Business Profiles',
        'Analyze citation gaps',
        'Compare reviews and ratings',
        'Identify keyword opportunities',
        'Generate improvement recommendations',
      ],
      requiredFields: [
        'businessName',
        'address',
        'yourProfile (rating, reviewCount, citationCount, photoCount, postCount, completenessScore)',
      ],
      optionalFields: [
        'categories',
        'lat',
        'lng',
        'radius (default: 10 miles, max: 50)',
        'knownCompetitors',
      ],
    },
  });
}
