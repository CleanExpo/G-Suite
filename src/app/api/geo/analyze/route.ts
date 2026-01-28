/**
 * GEO Analysis API Endpoint
 *
 * POST /api/geo/analyze
 *
 * Performs comprehensive local SEO analysis including:
 * - NAP consistency check
 * - Citation analysis
 * - Local schema validation
 * - Google Maps integration
 * - Google Business Profile data
 * - Geographic ranking prediction
 * - Local competitor analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGEOEngine } from '@/lib/geo/geo-engine';
import type { GEOAnalysisRequest } from '@/lib/geo/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
    try {
        // Authenticate user (optional for development)
        let userId: string | null = null;
        try {
            const authResult = await auth();
            userId = authResult.userId;
        } catch (error) {
            console.warn('[POST /api/geo/analyze] Clerk authentication not configured, allowing unauthenticated access');
            userId = 'dev_user'; // Dev mode fallback
        }

        // Parse request body
        const body = await req.json();

        // Validate required fields
        const validation = validateAnalysisRequest(body);
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

        const request: GEOAnalysisRequest = {
            url: body.url,
            businessName: body.businessName,
            address: body.address,
            phone: body.phone,
            targetKeywords: body.targetKeywords || [],
            targetLocation: body.targetLocation,
            categories: body.categories,
            serviceArea: body.serviceArea
        };

        console.log(`[POST /api/geo/analyze] Analyzing ${request.businessName} for user ${userId}`);

        // Perform analysis
        const engine = getGEOEngine();
        const result = await engine.analyze(request);

        return NextResponse.json({
            success: true,
            data: result,
            meta: {
                version: 'v1',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[POST /api/geo/analyze] Error:', error);

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
 * Validate GEO analysis request
 */
function validateAnalysisRequest(body: any): { valid: boolean; error?: string } {
    if (!body.url) {
        return { valid: false, error: 'Missing required field: url' };
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

    if (!body.targetLocation) {
        return { valid: false, error: 'Missing required field: targetLocation' };
    }

    // Validate URL format
    try {
        new URL(body.url);
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }

    // Validate phone format (basic check)
    const phonePattern = /^[\d\s\-\(\)\+]+$/;
    if (!phonePattern.test(body.phone)) {
        return { valid: false, error: 'Invalid phone number format' };
    }

    return { valid: true };
}

/**
 * Get analysis info
 */
export async function GET(req: NextRequest): Promise<Response> {
    return NextResponse.json({
        success: true,
        data: {
            name: 'GEO Analysis API',
            version: 'v1',
            description: 'Comprehensive local SEO analysis',
            features: [
                'NAP consistency check',
                'Citation analysis',
                'Local schema validation',
                'Google Maps integration',
                'Google Business Profile integration',
                'Geographic ranking prediction',
                'Local competitor analysis'
            ],
            requiredFields: [
                'url',
                'businessName',
                'address',
                'phone',
                'targetLocation'
            ],
            optionalFields: [
                'targetKeywords',
                'categories',
                'serviceArea'
            ]
        }
    });
}
