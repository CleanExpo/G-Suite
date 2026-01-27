/**
 * Monitoring Metrics API
 *
 * GET /api/monitoring/metrics - Time-series data for charts
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { metricsCollector } from '@/lib/monitoring';
import type { MetricType, TimeRange, Resolution } from '@/lib/monitoring/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monitoring/metrics
 *
 * Returns time-series data for a specific metric.
 *
 * Query Parameters:
 * - metric (required): queue_depth, throughput, error_rate, cost_per_hour, tokens_per_minute, active_agents
 * - timeRange (optional): 1h, 6h, 24h, 7d, 30d (default: 6h)
 * - resolution (optional): 1m, 5m, 15m, 1h, 1d (default: auto)
 */
export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get('metric') as MetricType;
    const timeRange = (searchParams.get('timeRange') || '6h') as TimeRange;
    const resolution = (searchParams.get('resolution') || '5m') as Resolution;

    if (!metric) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Metric parameter is required',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate metric type
    const validMetrics: MetricType[] = [
      'queue_depth',
      'throughput',
      'error_rate',
      'cost_per_hour',
      'tokens_per_minute',
      'active_agents',
    ];

    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: `Invalid metric. Must be one of: ${validMetrics.join(', ')}`,
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const { dataPoints, aggregates } = await metricsCollector.getTimeSeriesData(
      userId,
      metric,
      timeRange,
      resolution
    );

    return NextResponse.json(
      {
        success: true,
        metric,
        timeRange,
        resolution,
        dataPoints,
        aggregates,
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60', // 1-minute cache
        },
      }
    );
  } catch (error: any) {
    console.error('[Monitoring API] Error fetching metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch metrics',
          details: error.message,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
