/**
 * UNI-175: KPI API Routes - Single KPI Operations
 * GET /api/kpis/[id] - Get KPI by ID
 * PATCH /api/kpis/[id] - Update KPI
 * DELETE /api/kpis/[id] - Delete KPI
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getKPIById,
  updateKPI,
  deleteKPI,
  type KPIUpdate,
} from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// GET /api/kpis/[id] - Get KPI by ID
// ────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const kpi = await getKPIById(userId, id);

    if (!kpi) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'KPI not found' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kpi,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/kpis/[id] - Update KPI
// ────────────────────────────────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const update: KPIUpdate = {
      name: body.name,
      description: body.description,
      formula: body.formula,
      targetValue: body.targetValue,
      targetPeriod: body.targetPeriod,
      unit: body.unit,
      format: body.format,
      isVisible: body.isVisible,
      sortOrder: body.sortOrder,
    };

    const kpi = await updateKPI(userId, id, update);

    return NextResponse.json({
      success: true,
      data: kpi,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'KPI not found or access denied') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/kpis/[id] - Delete KPI
// ────────────────────────────────────────────────────────────────────────────

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await deleteKPI(userId, id);

    return NextResponse.json({
      success: true,
      data: { message: 'KPI deleted successfully' },
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'KPI not found or access denied') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}
