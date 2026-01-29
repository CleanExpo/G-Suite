/**
 * Analytics Campaigns API
 * 
 * GET /api/analytics/campaigns
 * Returns campaign performance data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGA4Client } from '@/lib/google/ga4-client';
import type { AnalyticsAPIResponse, CampaignReport } from '@/lib/analytics/types';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '28');
        const limit = parseInt(searchParams.get('limit') || '25');

        const client = getGA4Client();
        const { startDate, endDate } = client.getDateRange(days);

        const campaignReport = await client.getCampaignPerformance(startDate, endDate, limit);

        const response: AnalyticsAPIResponse<CampaignReport> = {
            success: true,
            data: campaignReport,
            meta: {
                propertyId: process.env.GA4_PROPERTY_ID || 'mock',
            },
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[Analytics API] Campaigns error:', error.message);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'ANALYTICS_ERROR', message: error.message },
            },
            { status: 500 }
        );
    }
}
