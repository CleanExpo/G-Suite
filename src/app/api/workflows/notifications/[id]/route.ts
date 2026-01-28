/**
 * UNI-174: Notification [ID] API Route
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getNotificationById, markNotificationAsRead } from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// GET: Get notification by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;
    const notification = await getNotificationById(userId, id);

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Notification not found' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
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

// PATCH: Mark notification as read
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;
    const notification = await markNotificationAsRead(userId, id);

    return NextResponse.json({
      success: true,
      data: notification,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

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
