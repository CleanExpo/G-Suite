/**
 * UNI-175: KPI API Routes
 * POST /api/kpis - Create KPI
 * GET /api/kpis - List KPIs with filters
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createKPI,
  listKPIs,
  type KPIInput,
  type KPIFilter,
  type PaginationOptions,
} from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// POST /api/kpis - Create KPI
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
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
    const body = await req.json();

    if (!body.name || !body.category || !body.metric || !body.formula) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Name, category, metric, and formula are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const input: KPIInput = {
      name: body.name,
      description: body.description,
      category: body.category,
      metric: body.metric,
      formula: body.formula,
      targetValue: body.targetValue,
      targetPeriod: body.targetPeriod,
      unit: body.unit,
      format: body.format,
      isVisible: body.isVisible,
      sortOrder: body.sortOrder,
    };

    const kpi = await createKPI(userId, input);

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
// GET /api/kpis - List KPIs
// ────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);

    // Parse filters
    const filter: KPIFilter = {
      category: searchParams.get('category') as any,
      isVisible: searchParams.has('isVisible')
        ? searchParams.get('isVisible') === 'true'
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Parse pagination
    const pagination: PaginationOptions = {
      page: searchParams.has('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
    };

    const result = await listKPIs(userId, filter, pagination);

    return NextResponse.json({
      success: true,
      data: result,
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
