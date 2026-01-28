/**
 * UNI-174: Notifications API Routes
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  listNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  type NotificationFilter,
} from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// GET: List notifications
export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);

    // Check if requesting unread count
    if (searchParams.get('count') === 'unread') {
      const count = await getUnreadNotificationCount(userId);
      return NextResponse.json({
        success: true,
        data: { unreadCount: count },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      });
    }

    // Parse filters
    const filter: NotificationFilter = {
      type: searchParams.get('type') as any,
      status: searchParams.get('status') as any,
      triggerEvent: searchParams.get('triggerEvent') as any,
      referenceType: searchParams.get('referenceType') || undefined,
      referenceId: searchParams.get('referenceId') || undefined,
      fromDate: searchParams.get('fromDate')
        ? new Date(searchParams.get('fromDate')!)
        : undefined,
      toDate: searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined,
    };

    // Parse pagination
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };

    const result = await listNotifications(userId, filter, pagination);

    return NextResponse.json({
      success: true,
      data: result,
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

// POST: Mark all notifications as read
export async function POST(req: Request) {
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
    const count = await markAllNotificationsAsRead(userId);

    return NextResponse.json({
      success: true,
      data: { markedAsRead: count },
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
