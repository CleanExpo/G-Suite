/**
 * UNI-175: Report Run API Route
 * POST /api/reports/[id]/run - Execute report query
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getReportResult } from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// POST /api/reports/[id]/run - Execute Report Query
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
    const body = await req.json().catch(() => ({}));

    // Check if forceRefresh is requested
    const forceRefresh = body.forceRefresh === true;

    const result = await getReportResult(userId, id, forceRefresh);

    return NextResponse.json({
      success: true,
      data: result,
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
