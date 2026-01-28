/**
 * UNI-171: Interactions API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createInteraction, listInteractions } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.type || !body.subject) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Type and subject are required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 400 });
    }
    const interaction = await createInteraction(userId, body);
    return NextResponse.json({ success: true, data: interaction, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 201 });
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
      type: searchParams.get('type') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      dealId: searchParams.get('dealId') || undefined,
      status: searchParams.get('status') || undefined,
    };
    const result = await listInteractions(userId, filters, page, limit);
    return NextResponse.json({ success: true, data: result, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
