/**
 * UNI-171: Task Detail API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getTaskById, updateTask, deleteTask } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { id } = await params;
    const task = await getTaskById(userId, id);
    if (!task) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: task, meta: { version: 'v1', timestamp: new Date().toISOString() } });
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
    const updated = await updateTask(userId, id, body);
    if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
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
    const deleted = await deleteTask(userId, id);
    if (!deleted) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: { message: 'Task deleted successfully' }, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
