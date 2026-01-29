/**
 * Analytics Attribution API
 * 
 * POST /api/analytics/attribution
 * Returns attribution report for specified model
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAttributionEngine } from '@/lib/analytics/attribution-engine';
import type {
    AnalyticsAPIResponse,
    AttributionReport,
    AttributionModel,
    ConversionPath,
    TouchPoint
} from '@/lib/analytics/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { model = 'last_click', days = 28 } = body;

        // Validate model
        const validModels: AttributionModel[] = [
            'last_click', 'first_click', 'linear', 'time_decay', 'position_based'
        ];

        if (!validModels.includes(model)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_MODEL',
                        message: `Invalid model. Valid options: ${validModels.join(', ')}`
                    },
                },
                { status: 400 }
            );
        }

        // Generate mock conversion paths for demo
        // In production, these would come from GA4 or a data warehouse
        const paths = generateMockPaths(50);

        const engine = getAttributionEngine();
        const report = engine.calculateAttribution(paths, model as AttributionModel);

        // Set date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        report.dateRange = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };

        const response: AnalyticsAPIResponse<AttributionReport> = {
            success: true,
            data: report,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[Analytics API] Attribution error:', error.message);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'ATTRIBUTION_ERROR', message: error.message },
            },
            { status: 500 }
        );
    }
}

/**
 * Generate mock conversion paths for demonstration
 */
function generateMockPaths(count: number): ConversionPath[] {
    const sources = [
        { source: 'google', medium: 'cpc', channel: 'paid_search' },
        { source: 'google', medium: 'organic', channel: 'organic_search' },
        { source: 'facebook', medium: 'paid_social', channel: 'social' },
        { source: 'newsletter', medium: 'email', channel: 'email' },
        { source: 'direct', medium: 'none', channel: 'direct' },
        { source: 'referral', medium: 'referral', channel: 'referral' },
    ];

    const paths: ConversionPath[] = [];

    for (let i = 0; i < count; i++) {
        const pathLength = Math.floor(Math.random() * 4) + 1; // 1-4 touchpoints
        const touchPoints: TouchPoint[] = [];

        for (let j = 0; j < pathLength; j++) {
            const sourceData = sources[Math.floor(Math.random() * sources.length)];
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - (pathLength - j) * Math.random() * 7);

            touchPoints.push({
                timestamp,
                source: sourceData.source,
                medium: sourceData.medium,
                channel: sourceData.channel,
            });
        }

        paths.push({
            pathId: `path_${i}`,
            touchPoints,
            conversionValue: Math.floor(Math.random() * 500) + 50,
            timeToConversion: Math.floor(Math.random() * 168) + 1, // 1-168 hours
        });
    }

    return paths;
}
