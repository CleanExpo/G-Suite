/**
 * UNI-171: Activity Timeline API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getContactTimeline, getCompanyTimeline, getDealTimeline } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');
    const companyId = searchParams.get('companyId');
    const dealId = searchParams.get('dealId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let timeline;
    if (contactId) {
      timeline = await getContactTimeline(userId, contactId, limit);
    } else if (companyId) {
      timeline = await getCompanyTimeline(userId, companyId, limit);
    } else if (dealId) {
      timeline = await getDealTimeline(userId, dealId, limit);
    } else {
      return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'contactId, companyId, or dealId is required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: timeline, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
