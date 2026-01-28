/**
 * UNI-171: Sales Forecast API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSalesForecast } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const forecast = await getSalesForecast(userId);
    return NextResponse.json({ success: true, data: forecast, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
