/**
 * UNI-175: Report Export API Route
 * POST /api/reports/[id]/export - Export report to PDF or Excel
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getReportResult } from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// POST /api/reports/[id]/export - Export Report
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const format = body.format || 'pdf'; // pdf or excel

    if (!['pdf', 'excel'].includes(format)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Format must be pdf or excel' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    // Get report result
    const result = await getReportResult(userId, id, false);

    // TODO: Implement actual PDF/Excel generation
    // For now, return JSON data that can be used by frontend to generate exports
    // In production, use libraries like:
    // - PDF: @react-pdf/renderer or jsPDF
    // - Excel: exceljs or xlsx

    return NextResponse.json({
      success: true,
      data: {
        format,
        result,
        message: 'Export endpoint ready. Implement PDF/Excel generation as needed.',
      },
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'Report not found') {
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
