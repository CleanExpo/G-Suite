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
import { getRankingPredictor, type RankingFactors } from '@/lib/geo/ranking-predictor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
    try {
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

        // Build ranking factors from request
        const factors: RankingFactors = {
            distanceKm: body.distanceKm || 2,
            authorityScore: body.authorityScore || 60,
            reviewScore: body.reviewScore || 70,
            categoryRelevance: body.categoryRelevance || 0.9
        };

        console.log(`[POST /api/geo/rankings] Predicting ranking for "${body.keyword}" in ${body.location}`);

        // Predict ranking
        const predictor = getRankingPredictor();
        const prediction = predictor.predictRank(factors);

        return NextResponse.json({
            success: true,
            data: {
                ...prediction,
                keyword: body.keyword,
                location: body.location,
                businessName: body.businessName
            },
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

    return { valid: true };
}

/**
 * Get ranking prediction info
 */
export async function GET(): Promise<Response> {
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
                'businessName'
            ],
            optionalFields: [
                'distanceKm',
                'authorityScore',
                'reviewScore',
                'categoryRelevance'
            ]
        }
    });
}
