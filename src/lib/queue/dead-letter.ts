/**
 * UNI-167: Dead Letter Queue Management
 *
 * Persists permanently failed jobs to Prisma for investigation and requeuing.
 * Jobs land here after exhausting all retry attempts.
 *
 * Capabilities:
 * - Add entries from failed job processor hooks
 * - List unresolved entries (for admin dashboard)
 * - Requeue: create a new job from a DLQ entry
 * - Resolve: mark as manually handled without requeuing
 * - Stats: aggregate counts by queue
 */

import type { DeadLetterInfo, AddJobResult } from './types';

export class DeadLetterQueue {
  /**
   * Add a permanently failed job to the dead letter queue.
   * Called from JobProcessor when a job exhausts all retry attempts.
   */
  async addEntry(
    queue: string,
    jobName: string,
    bullmqId: string,
    payload: Record<string, unknown>,
    error: string,
    attempts: number,
    userId: string
  ): Promise<string> {
    try {
      const prisma = (await import('@/prisma')).default;
      const entry = await prisma.deadLetterEntry.create({
        data: {
          queue,
          jobName,
          bullmqId,
          payload: payload as Record<string, any>,
          error,
          attempts,
          userId,
        },
      });

      console.log(`[DLQ] Entry created: ${entry.id} (queue: ${queue}, job: ${jobName})`);
      return entry.id;
    } catch (err: any) {
      console.error('[DLQ] Failed to create entry:', err.message);
      throw err;
    }
  }

  /**
   * List unresolved dead letter entries with optional filtering.
   */
  async listEntries(options?: {
    queue?: string;
    userId?: string;
    limit?: number;
  }): Promise<DeadLetterInfo[]> {
    try {
      const prisma = (await import('@/prisma')).default;
      const entries = await prisma.deadLetterEntry.findMany({
        where: {
          resolvedAt: null, // Only unresolved
          ...(options?.queue ? { queue: options.queue } : {}),
          ...(options?.userId ? { userId: options.userId } : {}),
        },
        orderBy: { failedAt: 'desc' },
        take: options?.limit ?? 50,
      });

      return entries.map((e) => ({
        id: e.id,
        queue: e.queue,
        jobName: e.jobName,
        payload: e.payload as Record<string, unknown>,
        error: e.error,
        attempts: e.attempts,
        failedAt: e.failedAt.toISOString(),
      }));
    } catch (err: any) {
      console.error('[DLQ] Failed to list entries:', err.message);
      return [];
    }
  }

  /**
   * Requeue a dead letter entry: creates a new job in the original queue
   * and marks the DLQ entry as resolved.
   */
  async requeue(entryId: string): Promise<AddJobResult> {
    try {
      const prisma = (await import('@/prisma')).default;
      const entry = await prisma.deadLetterEntry.findUnique({
        where: { id: entryId },
      });

      if (!entry) {
        return { success: false, error: 'DLQ entry not found' };
      }

      if (entry.resolvedAt) {
        return { success: false, error: 'DLQ entry already resolved' };
      }

      // Create a new job in the original queue
      const { taskQueue } = await import('./task-queue');
      const result = await taskQueue.addJob(
        entry.queue,
        entry.jobName,
        entry.payload as Record<string, unknown>,
        {
          userId: entry.userId,
          attempts: 3, // Fresh retry budget
        }
      );

      if (result.success) {
        // Mark as resolved
        await prisma.deadLetterEntry.update({
          where: { id: entryId },
          data: { resolvedAt: new Date() },
        });

        console.log(`[DLQ] Entry ${entryId} requeued as job ${result.jobId}`);
      }

      return result;
    } catch (err: any) {
      console.error('[DLQ] Requeue failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Mark a DLQ entry as resolved without requeuing (manual resolution).
   */
  async resolve(entryId: string): Promise<void> {
    try {
      const prisma = (await import('@/prisma')).default;
      await prisma.deadLetterEntry.update({
        where: { id: entryId },
        data: { resolvedAt: new Date() },
      });
      console.log(`[DLQ] Entry ${entryId} manually resolved`);
    } catch (err: any) {
      console.error('[DLQ] Resolve failed:', err.message);
    }
  }

  /**
   * Get aggregate statistics for the dead letter queue.
   */
  async getStats(): Promise<{
    total: number;
    unresolved: number;
    byQueue: Record<string, number>;
  }> {
    try {
      const prisma = (await import('@/prisma')).default;

      const [total, unresolved, groupedByQueue] = await Promise.all([
        prisma.deadLetterEntry.count(),
        prisma.deadLetterEntry.count({ where: { resolvedAt: null } }),
        prisma.deadLetterEntry.groupBy({
          by: ['queue'],
          where: { resolvedAt: null },
          _count: true,
        }),
      ]);

      const byQueue: Record<string, number> = {};
      for (const group of groupedByQueue) {
        byQueue[group.queue] = group._count;
      }

      return { total, unresolved, byQueue };
    } catch (err: any) {
      console.error('[DLQ] Stats query failed:', err.message);
      return { total: 0, unresolved: 0, byQueue: {} };
    }
  }
}

/** Singleton instance */
export const deadLetterQueue = new DeadLetterQueue();
