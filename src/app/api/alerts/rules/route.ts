/**
 * Phase 9.2: Alert Rules API
 *
 * Manage alert rules for budget and system metrics.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';
import { alertEvaluator } from '@/lib/monitoring/alert-evaluator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/alerts/rules
 * List all alert rules for the authenticated user.
 */
export async function GET() {
  try {
    const userId = await getAuthUserIdOrDev();

    const rules = await prisma.alertRule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        firings: {
          where: { resolvedAt: null },
          orderBy: { triggeredAt: 'desc' },
          take: 1,
        },
      },
    });

    const formattedRules = rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      ruleType: rule.ruleType,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      windowMinutes: rule.windowMinutes,
      channels: rule.channels,
      isActive: rule.isActive,
      isFiring: rule.isFiring,
      lastFiredAt: rule.lastFiredAt,
      currentFiring: rule.firings[0] ?? null,
      createdAt: rule.createdAt,
    }));

    return NextResponse.json({
      success: true,
      rules: formattedRules,
    });
  } catch (error: any) {
    console.error('[Alert Rules GET] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/rules
 * Create a new alert rule.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserIdOrDev();
    const body = await req.json();

    const {
      name,
      description,
      ruleType = 'threshold',
      metric,
      condition,
      threshold,
      windowMinutes = 5,
      channels = ['in_app'],
      webhookIds = [],
    } = body;

    // Validate required fields
    if (!name || !metric || !condition || threshold === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, metric, condition, threshold' },
        { status: 400 }
      );
    }

    // Validate metric type
    const validMetrics = [
      'error_rate',
      'queue_depth',
      'cost_per_hour',
      'tokens_per_minute',
      'throughput',
      'active_agents',
      'budget_usage',
    ];
    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { success: false, error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate condition
    const validConditions = ['gt', 'gte', 'lt', 'lte', 'eq'];
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { success: false, error: `Invalid condition. Must be one of: ${validConditions.join(', ')}` },
        { status: 400 }
      );
    }

    const rule = await prisma.alertRule.create({
      data: {
        name,
        description,
        ruleType,
        metric,
        condition,
        threshold,
        windowMinutes,
        channels,
        webhookIds,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      rule: {
        id: rule.id,
        name: rule.name,
        metric: rule.metric,
        condition: rule.condition,
        threshold: rule.threshold,
        isActive: rule.isActive,
        createdAt: rule.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Alert Rules POST] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts/rules
 * Update an existing alert rule.
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthUserIdOrDev();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing rule ID' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.alertRule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    const rule = await prisma.alertRule.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      rule: {
        id: rule.id,
        name: rule.name,
        isActive: rule.isActive,
        threshold: rule.threshold,
        updatedAt: rule.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Alert Rules PATCH] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/rules
 * Delete an alert rule.
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthUserIdOrDev();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing rule ID' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.alertRule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    await prisma.alertRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Alert Rules DELETE] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
