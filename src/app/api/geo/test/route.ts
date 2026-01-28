/**
 * GEO Test Endpoint (No Auth Required)
 * For testing/demo purposes only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGEOEngine } from '@/lib/geo/geo-engine';
import type { GEOAnalysisRequest } from '@/lib/geo/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();

        const request: GEOAnalysisRequest = {
            url: body.url || 'https://example.com',
            businessName: body.businessName || 'Test Business',
            address: body.address || '123 Main St, New York, NY 10001',
            phone: body.phone || '(555) 123-4567',
            targetKeywords: body.targetKeywords || ['business near me'],
            targetLocation: body.targetLocation || 'New York, NY',
            categories: body.categories || ['Local Business'],
            serviceArea: body.serviceArea
        };

        console.log('[TEST] Running GEO analysis for:', request.businessName);

        const engine = getGEOEngine();
        const result = await engine.analyze(request);

        return NextResponse.json({
            success: true,
            data: result,
            meta: {
                version: 'test-v1',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[TEST] Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: error.message || 'An unexpected error occurred',
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest): Promise<Response> {
    return NextResponse.json({
        success: true,
        message: 'GEO Test Endpoint - POST a request with business data to test the GEO analysis',
        example: {
            url: 'https://example-bakery.com',
            businessName: 'Example Bakery',
            address: '123 Main St, New York, NY 10001',
            phone: '(555) 123-4567',
            targetLocation: 'New York, NY',
            targetKeywords: ['bakery near me', 'fresh bread'],
            categories: ['Bakery', 'Cafe']
        }
    });
}
