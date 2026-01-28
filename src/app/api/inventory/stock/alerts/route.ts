/**
 * UNI-172: Stock Alerts API - Low Stock Alerts
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getLowStockAlerts } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

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
    const alerts = await getLowStockAlerts(userId);
    return NextResponse.json({
      success: true,
      data: alerts,
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
