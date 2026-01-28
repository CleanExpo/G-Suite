/**
 * UNI-175: Report API Routes
 * POST /api/reports - Create report
 * GET /api/reports - List reports with filters
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createReport,
  listReports,
  type ReportInput,
  type ReportListFilter,
  type PaginationOptions,
} from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// POST /api/reports - Create Report
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

    if (!body.name || !body.type || !body.query) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Name, type, and query are required' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const input: ReportInput = {
      name: body.name,
      description: body.description,
      type: body.type,
      query: body.query,
      chartType: body.chartType,
      chartConfig: body.chartConfig,
      isScheduled: body.isScheduled,
      schedule: body.schedule,
      recipients: body.recipients,
      cacheTTL: body.cacheTTL,
    };

    const report = await createReport(userId, input);

    return NextResponse.json({
      success: true,
      data: report,
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
// GET /api/reports - List Reports
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
    const filter: ReportListFilter = {
      type: searchParams.get('type') as any,
      isScheduled: searchParams.has('isScheduled')
        ? searchParams.get('isScheduled') === 'true'
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

    const result = await listReports(userId, filter, pagination);

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
