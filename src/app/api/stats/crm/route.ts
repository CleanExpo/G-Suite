/**
 * UNI-175: CRM Statistics API Route
 * GET /api/stats/crm - Get CRM statistics
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCRMStatistics } from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// GET /api/stats/crm - Get CRM Statistics
// ────────────────────────────────────────────────────────────────────────────

export async function GET() {
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
    const stats = await getCRMStatistics(userId);

    return NextResponse.json({
      success: true,
      data: stats,
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
