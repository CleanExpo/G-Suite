/**
 * UNI-174: Workflow Templates API Routes
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createWorkflowTemplate,
  listWorkflowTemplates,
  type WorkflowTemplateInput,
  type WorkflowTemplateFilter,
} from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// POST: Create workflow template
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
    if (!body.name || !body.type || !body.triggerEvent || !body.steps) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Name, type, triggerEvent, and steps are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const input: WorkflowTemplateInput = {
      name: body.name,
      description: body.description,
      type: body.type,
      triggerEvent: body.triggerEvent,
      steps: body.steps,
      slaHours: body.slaHours,
      escalationRules: body.escalationRules,
      isActive: body.isActive,
    };

    const template = await createWorkflowTemplate(userId, input);

    return NextResponse.json({
      success: true,
      data: template,
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

// GET: List workflow templates
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
    const filter: WorkflowTemplateFilter = {
      type: searchParams.get('type') as any,
      triggerEvent: searchParams.get('triggerEvent') as any,
      isActive: searchParams.get('isActive') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Parse pagination
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };

    const result = await listWorkflowTemplates(userId, filter, pagination);

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
