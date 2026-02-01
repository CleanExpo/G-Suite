/**
 * Analytics Overview API
 *
 * GET /api/analytics/overview
 * Returns dashboard metrics from GA4
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGA4Client } from '@/lib/google/ga4-client';
import type { AnalyticsAPIResponse, AnalyticsOverview } from '@/lib/analytics/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '28');

    const client = getGA4Client();
    const { startDate, endDate } = client.getDateRange(days);

    const overview = await client.getOverviewMetrics(startDate, endDate);
    const channels = await client.getChannelPerformance(startDate, endDate);

    const response: AnalyticsAPIResponse<{
      overview: AnalyticsOverview;
      channels: typeof channels;
    }> = {
      success: true,
      data: {
        overview,
        channels,
      },
      meta: {
        propertyId: process.env.GA4_PROPERTY_ID || 'mock',
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Analytics API] Overview error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'ANALYTICS_ERROR', message: error.message },
      },
      { status: 500 },
    );
  }
}
