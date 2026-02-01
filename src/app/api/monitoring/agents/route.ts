/**
 * Monitoring Agents API
 *
 * GET /api/monitoring/agents - Per-agent detailed status
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { metricsCollector } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monitoring/agents
 *
 * Returns detailed status for all agents including:
 * - Current status (active, idle, failed)
 * - Performance metrics (executions, success rate, avg duration)
 * - Recent job history
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
    const agents = await metricsCollector.getAgentStatusDetail(userId);

    return NextResponse.json(
      {
        success: true,
        agents,
        total: agents.length,
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
    console.error('[Monitoring API] Error fetching agent status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch agent status',
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
