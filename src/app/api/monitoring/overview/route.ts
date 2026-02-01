/**
 * Monitoring Overview API
 *
 * GET /api/monitoring/overview - System health summary
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { metricsCollector } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monitoring/overview
 *
 * Returns comprehensive system health summary including:
 * - Health score and status
 * - Agent status breakdown
 * - Queue metrics
 * - Error rates
 * - Resource utilization
 * - Active alerts
 */
export async function GET() {
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
      { status: 401 },
    );
  }

  try {
    const metrics = await metricsCollector.collectCurrentMetrics(userId);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        ...metrics,
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=30', // 30-second cache
        },
      },
    );
  } catch (error: any) {
    console.error('[Monitoring API] Error collecting metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to collect metrics',
          details: error.message,
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
