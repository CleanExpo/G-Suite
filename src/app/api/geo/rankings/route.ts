/**
 * Geographic Ranking Prediction API Endpoint
 *
 * POST /api/geo/rankings
 *
 * Predicts local search rankings based on:
 * - Distance from searcher
 * - Keyword relevance
 * - Business prominence (reviews, citations)
 * - On-page optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRankingPredictor } from '@/lib/geo/ranking-predictor';
import type { RankingPredictorInput } from '@/lib/geo/ranking-predictor';

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
                        message: 'Authentication required'
                    }
                },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await req.json();

        // Validate required fields
        const validation = validateRankingRequest(body);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: validation.error
                    }
                },
                { status: 400 }
            );
        }

        const input: RankingPredictorInput = {
            keyword: body.keyword,
            location: body.location,
            businessName: body.businessName,
            address: body.address,
            phone: body.phone,
            website: body.website,
            categories: body.categories || [],
            gbpProfile: body.gbpProfile,
            napAnalysis: body.napAnalysis,
            citationAnalysis: body.citationAnalysis,
            localSchemaAnalysis: body.localSchemaAnalysis,
            competitors: body.competitors,
            lat: body.lat,
            lng: body.lng,
            searcherLat: body.searcherLat,
            searcherLng: body.searcherLng
        };

        console.log(`[POST /api/geo/rankings] Predicting ranking for "${input.keyword}" in ${input.location} for user ${userId}`);

        // Predict ranking
        const predictor = getRankingPredictor();
        const prediction = await predictor.predictRanking(input);

        return NextResponse.json({
            success: true,
            data: prediction,
            meta: {
                version: 'v1',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[POST /api/geo/rankings] Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: error.message || 'An unexpected error occurred',
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                },
                meta: {
                    version: 'v1',
                    timestamp: new Date().toISOString()
                }
            },
            { status: 500 }
        );
    }
}

/**
 * Validate ranking prediction request
 */
function validateRankingRequest(body: any): { valid: boolean; error?: string } {
    if (!body.keyword) {
        return { valid: false, error: 'Missing required field: keyword' };
    }

    if (!body.location) {
        return { valid: false, error: 'Missing required field: location' };
    }

    if (!body.businessName) {
        return { valid: false, error: 'Missing required field: businessName' };
    }

    if (!body.address) {
        return { valid: false, error: 'Missing required field: address' };
    }

    if (!body.phone) {
        return { valid: false, error: 'Missing required field: phone' };
    }

    return { valid: true };
}

/**
 * Get ranking prediction info
 */
export async function GET(req: NextRequest): Promise<Response> {
    return NextResponse.json({
        success: true,
        data: {
            name: 'Geographic Ranking Prediction API',
            version: 'v1',
            description: 'Predicts local search rankings based on Google local pack algorithm',
            rankingFactors: [
                'Distance (30%) - Proximity to searcher',
                'Relevance (25%) - Keyword match and categories',
                'Prominence (30%) - Reviews, ratings, citations',
                'Optimization (15%) - On-page SEO and schema'
            ],
            requiredFields: [
                'keyword',
                'location',
                'businessName',
                'address',
                'phone'
            ],
            optionalFields: [
                'website',
                'categories',
                'gbpProfile',
                'napAnalysis',
                'citationAnalysis',
                'localSchemaAnalysis',
                'competitors',
                'lat',
                'lng',
                'searcherLat',
                'searcherLng'
            ]
        }
    });
}
