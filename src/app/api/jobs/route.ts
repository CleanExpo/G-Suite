import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { taskQueue } from '@/lib/queue';
import type { JobStatus } from '@/lib/queue';

/**
 * POST /api/jobs — Submit a new background job
 *
 * Body:
 * {
 *   "queue": "missions" | "agents",
 *   "name": "run-mission",
 *   "payload": { ... },
 *   "priority": 0,       // optional, lower = higher priority
 *   "delay": 0,          // optional, ms
 *   "maxAttempts": 3     // optional
 * }
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { queue, name, payload, priority, delay, maxAttempts } = body;

    if (!queue || !name) {
      return NextResponse.json(
        { message: 'Fields "queue" and "name" are required' },
        { status: 400 },
      );
    }

    const result = await taskQueue.addJob(queue, name, payload ?? {}, {
      userId,
      priority: priority ?? 0,
      delay: delay ?? 0,
      attempts: maxAttempts ?? 3,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error ?? 'Failed to submit job' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      dbJobId: result.dbJobId,
    });
  } catch (error: any) {
    console.error('[API /api/jobs POST] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * GET /api/jobs — List jobs for the authenticated user
 *
 * Query params:
 *   status: waiting | active | completed | failed | delayed (default: waiting)
 *   queue: queue name (default: missions)
 *   limit: max results (default: 25)
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queue = searchParams.get('queue') ?? 'missions';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '25', 10), 100);

    // Query from Prisma for user-scoped results
    try {
      const prisma = (await import('@/prisma')).default;
      const status = searchParams.get('status');

      const jobs = await prisma.queueJob.findMany({
        where: {
          userId,
          queue,
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          queue: true,
          name: true,
          status: true,
          priority: true,
          attempts: true,
          maxAttempts: true,
          error: true,
          scheduledFor: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ success: true, jobs });
    } catch (dbErr: any) {
      // Fallback: return queue metrics if Prisma is unavailable
      const metrics = await taskQueue.getQueueMetrics(queue);
      return NextResponse.json({ success: true, jobs: [], metrics });
    }
  } catch (error: any) {
    console.error('[API /api/jobs GET] Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
