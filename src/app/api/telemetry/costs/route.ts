import { NextResponse } from 'next/server';
import prisma from '@/prisma';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';
import type { AgentCostEntry } from '@/lib/telemetry/agent-cost-collector';

export const dynamic = 'force-dynamic';

/**
 * GET /api/telemetry/costs
 * Returns per-agent cost telemetry, budget alerts, and historical trends
 * for the authenticated user.
 */
export async function GET() {
  try {
    const userId = await getAuthUserIdOrDev();

    // Fetch missions and wallet in parallel
    const [missions, wallet] = await Promise.all([
      prisma.mission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          status: true,
          cost: true,
          agentCosts: true,
          createdAt: true,
        },
      }),
      prisma.userWallet.findUnique({
        where: { clerkId: userId },
        select: { balance: true },
      }),
    ]);

    const walletBalance = wallet?.balance ?? 0;

    // ── Summary ────────────────────────────────────────────────────────
    const totalSpent = missions.reduce((sum, m) => sum + m.cost, 0);
    const missionCount = missions.length;
    const avgCostPerMission = missionCount > 0 ? Math.round(totalSpent / missionCount) : 0;
    const budgetUsage = walletBalance > 0
      ? Math.round((totalSpent / (totalSpent + walletBalance)) * 100)
      : 0;

    // ── Per-agent breakdown ────────────────────────────────────────────
    const agentTotals = new Map<string, {
      totalCost: number;
      totalTokens: number;
      totalDuration: number;
      executionCount: number;
    }>();

    for (const mission of missions) {
      if (!mission.agentCosts || typeof mission.agentCosts !== 'object') continue;
      const costs = mission.agentCosts as unknown as Record<string, AgentCostEntry>;

      for (const [agentName, entry] of Object.entries(costs)) {
        const existing = agentTotals.get(agentName) || {
          totalCost: 0,
          totalTokens: 0,
          totalDuration: 0,
          executionCount: 0,
        };
        existing.totalCost += entry.cost || 0;
        existing.totalTokens += entry.tokens || 0;
        existing.totalDuration += entry.duration || 0;
        existing.executionCount += 1;
        agentTotals.set(agentName, existing);
      }
    }

    const agentBreakdown = Array.from(agentTotals.entries())
      .map(([agentName, stats]) => ({
        agentName,
        totalCost: stats.totalCost,
        totalTokens: stats.totalTokens,
        avgDuration: stats.executionCount > 0
          ? Math.round(stats.totalDuration / stats.executionCount)
          : 0,
        executionCount: stats.executionCount,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    // ── Recent missions with cost details ──────────────────────────────
    const recentMissions = missions.slice(0, 20).map((m) => ({
      id: m.id,
      status: m.status,
      totalCost: m.cost,
      agentCosts: m.agentCosts,
      createdAt: m.createdAt,
    }));

    // ── Daily cost trend (last 30 days) ────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap = new Map<string, { totalCost: number; missionCount: number }>();

    for (const mission of missions) {
      if (new Date(mission.createdAt) < thirtyDaysAgo) continue;
      const dateKey = new Date(mission.createdAt).toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { totalCost: 0, missionCount: 0 };
      existing.totalCost += mission.cost;
      existing.missionCount += 1;
      dailyMap.set(dateKey, existing);
    }

    const costTrend = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        totalCost: stats.totalCost,
        missionCount: stats.missionCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      summary: {
        totalSpent,
        walletBalance,
        avgCostPerMission,
        budgetUsage,
        budgetAlert: budgetUsage > 80,
        missionCount,
      },
      agentBreakdown,
      recentMissions,
      costTrend,
    });
  } catch (error: any) {
    console.error('[Telemetry Costs GET] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
