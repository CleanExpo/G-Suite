/**
 * UNI-171: CRM Tasks API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createTask, listTasks } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.title || !body.assigneeId) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_INPUT', message: 'Title and assigneeId are required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 400 });
    }
    const task = await createTask(userId, body);
    return NextResponse.json({ success: true, data: task, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 201 });
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
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      assigneeId: searchParams.get('assigneeId') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      dealId: searchParams.get('dealId') || undefined,
      overdue: searchParams.get('overdue') === 'true',
    };
    const result = await listTasks(userId, filters, page, limit);
    return NextResponse.json({ success: true, data: result, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
