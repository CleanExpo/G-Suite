/**
 * UNI-171: Deal Detail API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { id } = await params;
    const deal = await getDealById(userId, id);
    if (!deal) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Deal not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: deal, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateDeal(userId, id, body);
    if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Deal not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { id } = await params;
    const deleted = await deleteDeal(userId, id);
    if (!deleted) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Deal not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: { message: 'Deal deleted successfully' }, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
