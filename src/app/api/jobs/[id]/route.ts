import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/jobs/[id] — Get job details
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const prisma = (await import('@/prisma')).default;
    const job = await prisma.queueJob.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // Users can only see their own jobs
    if (job.userId !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        queue: job.queue,
        name: job.name,
        status: job.status,
        priority: job.priority,
        payload: job.payload,
        result: job.result,
        error: job.error,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        scheduledFor: job.scheduledFor,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[API /api/jobs/[id] GET] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/jobs/[id] — Cancel a pending/delayed job
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const prisma = (await import('@/prisma')).default;
    const job = await prisma.queueJob.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    if (job.userId !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Can only cancel waiting or delayed jobs
    if (job.status !== 'waiting' && job.status !== 'delayed') {
      return NextResponse.json(
        { message: `Cannot cancel job with status "${job.status}". Only waiting or delayed jobs can be cancelled.` },
        { status: 409 }
      );
    }

    // Update status in Prisma
    await prisma.queueJob.update({
      where: { id },
      data: { status: 'failed', error: 'Cancelled by user', completedAt: new Date() },
    });

    // Try to remove from BullMQ queue
    try {
      const { taskQueue } = await import('@/lib/queue');
      // We don't have the BullMQ job ID stored directly,
      // so we rely on the Prisma status update for now
      console.log(`[API /api/jobs/[id] DELETE] Job ${id} cancelled by user ${userId}`);
    } catch {
      // Non-critical: BullMQ removal is best-effort
    }

    return NextResponse.json({ success: true, message: 'Job cancelled' });
  } catch (error: any) {
    console.error('[API /api/jobs/[id] DELETE] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
