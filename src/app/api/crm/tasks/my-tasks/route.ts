/**
 * UNI-171: My Tasks API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMyTasks } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const tasks = await getMyTasks(userId, userId, status);
    return NextResponse.json({ success: true, data: tasks, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
