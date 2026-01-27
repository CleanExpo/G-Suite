/**
 * Individual Webhook Management
 *
 * GET    /api/webhooks/:id - Get webhook details
 * PATCH  /api/webhooks/:id - Update webhook
 * DELETE /api/webhooks/:id - Delete webhook
 */

import {NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import {
  getWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  listWebhookDeliveries,
} from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

/**
 * GET /api/webhooks/:id - Get webhook endpoint details with recent deliveries
 */
export async function GET(
  _req: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {userId} = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {status: 401}
    );
  }

  try {
    const {id} = await params;

    const endpoint = await getWebhookEndpoint(id, userId);

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        {status: 404}
      );
    }

    // Get recent deliveries
    const deliveries = await listWebhookDeliveries(id, userId, 10);

    return NextResponse.json({
      success: true,
      data: {
        ...endpoint,
        createdAt: endpoint.createdAt.toISOString(),
        updatedAt: endpoint.updatedAt.toISOString(),
        recentDeliveries: deliveries.map(d => ({
          id: d.id,
          eventType: d.eventType,
          status: d.status,
          attempts: d.attempts,
          responseCode: d.responseCode,
          error: d.error,
          sentAt: d.sentAt?.toISOString() || null,
          createdAt: d.createdAt.toISOString(),
        })),
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Webhooks API] Error fetching webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch webhook',
          details: error.message,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {status: 500}
    );
  }
}

/**
 * PATCH /api/webhooks/:id - Update webhook endpoint
 *
 * Body:
 * - url: string (optional)
 * - events: string[] (optional)
 * - isActive: boolean (optional)
 * - metadata: object (optional)
 */
export async function PATCH(
  req: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {userId} = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {status: 401}
    );
  }

  try {
    const {id} = await params;
    const body = await req.json();

    const updated = await updateWebhookEndpoint(id, userId, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Webhooks API] Error updating webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update webhook',
          details: error.message,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {status: 500}
    );
  }
}

/**
 * DELETE /api/webhooks/:id - Delete webhook endpoint
 */
export async function DELETE(
  _req: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {userId} = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {status: 401}
    );
  }

  try {
    const {id} = await params;

    const deleted = await deleteWebhookEndpoint(id, userId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
          meta: {
            version: 'v1',
            timestamp: new Date().toISOString(),
          },
        },
        {status: 404}
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Webhook deleted successfully',
        id,
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Webhooks API] Error deleting webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete webhook',
          details: error.message,
        },
        meta: {
          version: 'v1',
          timestamp: new Date().toISOString(),
        },
      },
      {status: 500}
    );
  }
}
