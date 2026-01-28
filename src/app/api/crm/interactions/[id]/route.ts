/**
 * UNI-171: Interaction Detail API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getInteractionById, updateInteraction, deleteInteraction } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 401 });

  try {
    const { id } = await params;
    const interaction = await getInteractionById(userId, id);
    if (!interaction) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Interaction not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: interaction, meta: { version: 'v1', timestamp: new Date().toISOString() } });
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
    const updated = await updateInteraction(userId, id, body);
    if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Interaction not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
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
    const deleted = await deleteInteraction(userId, id);
    if (!deleted) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Interaction not found' }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 404 });
    return NextResponse.json({ success: true, data: { message: 'Interaction deleted successfully' }, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 500 });
  }
}
