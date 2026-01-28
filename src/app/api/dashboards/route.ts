/**
 * UNI-175: Dashboard API Routes
 * POST /api/dashboards - Create dashboard
 * GET /api/dashboards - List dashboards with filters
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createDashboard,
  listDashboards,
  type DashboardInput,
  type DashboardFilter,
  type PaginationOptions,
} from '@/lib/reporting';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────
// POST /api/dashboards - Create Dashboard
// ────────────────────────────────────────────────────────────────────────────

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
    const body = await req.json();

    if (!body.name || !body.layout) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Name and layout are required' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const input: DashboardInput = {
      name: body.name,
      description: body.description,
      type: body.type,
      layout: body.layout,
      isPublic: body.isPublic,
      sharedWith: body.sharedWith,
      isDefault: body.isDefault,
      sortOrder: body.sortOrder,
    };

    const dashboard = await createDashboard(userId, input);

    return NextResponse.json({
      success: true,
      data: dashboard,
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

// ────────────────────────────────────────────────────────────────────────────
// GET /api/dashboards - List Dashboards
// ────────────────────────────────────────────────────────────────────────────

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

    // Parse filters
    const filter: DashboardFilter = {
      type: searchParams.get('type') as any,
      isPublic: searchParams.has('isPublic')
        ? searchParams.get('isPublic') === 'true'
        : undefined,
      isDefault: searchParams.has('isDefault')
        ? searchParams.get('isDefault') === 'true'
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Parse pagination
    const pagination: PaginationOptions = {
      page: searchParams.has('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
    };

    const result = await listDashboards(userId, filter, pagination);

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
