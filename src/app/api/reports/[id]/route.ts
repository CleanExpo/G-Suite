/**
 * UNI-175: Report API Routes - Single Report Operations
 * GET /api/reports/[id] - Get report by ID
 * PATCH /api/reports/[id] - Update report
 * DELETE /api/reports/[id] - Delete report
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getReportById,
  updateReport,
  deleteReport,
  type ReportUpdate,
} from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// GET /api/reports/[id] - Get Report by ID
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
    const report = await getReportById(userId, id);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Report not found' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

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
// PATCH /api/reports/[id] - Update Report
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

    const update: ReportUpdate = {
      name: body.name,
      description: body.description,
      query: body.query,
      chartType: body.chartType,
      chartConfig: body.chartConfig,
      isScheduled: body.isScheduled,
      schedule: body.schedule,
      recipients: body.recipients,
      cacheTTL: body.cacheTTL,
    };

    const report = await updateReport(userId, id, update);

    return NextResponse.json({
      success: true,
      data: report,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'Report not found or access denied') {
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
// DELETE /api/reports/[id] - Delete Report
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
    await deleteReport(userId, id);

    return NextResponse.json({
      success: true,
      data: { message: 'Report deleted successfully' },
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'Report not found or access denied') {
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
