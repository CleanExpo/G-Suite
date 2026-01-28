/**
 * UNI-174: Workflow Approval API Route
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { processApproval, type ApprovalInput } from '@/lib/workflows';

export const dynamic = 'force-dynamic';

// POST: Process approval or rejection
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

    // Validate required fields
    if (!body.stepId || typeof body.approved !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Step ID and approved (boolean) are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const input: ApprovalInput = {
      instanceId: id,
      stepId: body.stepId,
      approved: body.approved,
      comment: body.comment,
      approvedBy: userId,
    };

    const instance = await processApproval(userId, input);

    return NextResponse.json({
      success: true,
      data: instance,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (
      error.message === 'Workflow instance not found' ||
      error.message === 'Step not found'
    ) {
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
