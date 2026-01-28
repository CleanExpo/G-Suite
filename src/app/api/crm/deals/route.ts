/**
 * UNI-171: Deals API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createDeal, listDeals } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || !body.value || !body.stage || !body.ownerId) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Name, value, stage, and ownerId are required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 400 });
    }
    const deal = await createDeal(userId, body);
    return NextResponse.json({ success: true, data: deal, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filters = {
      stage: searchParams.get('stage') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      search: searchParams.get('search') || undefined,
    };
    const result = await listDeals(userId, filters, page, limit);
    return NextResponse.json({ success: true, data: result, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
