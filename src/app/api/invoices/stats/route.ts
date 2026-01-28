/**
 * UNI-173: Invoice Statistics API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getInvoiceStats } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// GET: Get invoice statistics
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
    const stats = await getInvoiceStats(userId);

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
