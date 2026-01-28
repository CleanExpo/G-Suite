/**
 * UNI-174: Toggle Workflow Template Status API Route
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { toggleWorkflowTemplateStatus } from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// POST: Toggle workflow template active status
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'isActive (boolean) is required' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const template = await toggleWorkflowTemplateStatus(userId, id, body.isActive);

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
