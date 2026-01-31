/**
 * Phase 9.2: Cost Optimization API
 *
 * Provides AI-powered cost analysis and optimization recommendations.
 */

import { NextResponse } from 'next/server';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';
import { costOptimizer } from '@/lib/telemetry/cost-optimizer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/telemetry/optimize
 * Returns cost analysis and optimization recommendations.
 */
export async function GET() {
  try {
    const userId = await getAuthUserIdOrDev();

    // Get quick summary first (fast)
    const summary = await costOptimizer.getQuickSummary(userId);

    // Get full analysis (includes AI recommendations)
    const analysis = await costOptimizer.analyzeCosts(userId);

    return NextResponse.json({
      success: true,
      summary,
      analysis,
    });
  } catch (error: any) {
    console.error('[Cost Optimize GET] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
