/**
 * UNI-174: Workflow Template [ID] API Routes
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getWorkflowTemplateById,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  toggleWorkflowTemplateStatus,
  cloneWorkflowTemplate,
  type WorkflowTemplateUpdate,
} from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// GET: Get workflow template by ID
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
    const template = await getWorkflowTemplateById(userId, id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workflow template not found' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

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

// PATCH: Update workflow template
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
    const body = await req.json();

    const update: WorkflowTemplateUpdate = {
      name: body.name,
      description: body.description,
      steps: body.steps,
      slaHours: body.slaHours,
      escalationRules: body.escalationRules,
      isActive: body.isActive,
    };

    const template = await updateWorkflowTemplate(userId, id, update);

    return NextResponse.json({
      success: true,
      data: template,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'Workflow template not found') {
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

// DELETE: Delete workflow template
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    await deleteWorkflowTemplate(userId, id);

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error.message === 'Workflow template not found') {
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
