/**
 * UNI-174: Workflow Instances API Routes
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createWorkflowInstance,
  listWorkflowInstances,
  type WorkflowInstanceInput,
  type WorkflowInstanceFilter,
} from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// POST: Create workflow instance (manual trigger)
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

    // Validate required fields
    if (!body.templateId || !body.referenceType || !body.referenceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Template ID, reference type, and reference ID are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const input: WorkflowInstanceInput = {
      templateId: body.templateId,
      referenceType: body.referenceType,
      referenceId: body.referenceId,
      metadata: body.metadata,
    };

    const instance = await createWorkflowInstance(userId, input);

    return NextResponse.json({
      success: true,
      data: instance,
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

// GET: List workflow instances
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
    const filter: WorkflowInstanceFilter = {
      templateId: searchParams.get('templateId') || undefined,
      status: searchParams.get('status') as any,
      referenceType: searchParams.get('referenceType') || undefined,
      referenceId: searchParams.get('referenceId') || undefined,
      isOverdue: searchParams.get('isOverdue') === 'true' ? true : undefined,
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

    const result = await listWorkflowInstances(userId, filter, pagination);

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
