/**
 * UNI-167: Task Queue Manager
 *
 * Wraps BullMQ Queue with:
 * - Named queue management (lazy-created)
 * - Priority-based job submission
 * - Prisma audit trail for every job
 * - Graceful degradation when Redis is unavailable
 */

import { Queue, type Job } from 'bullmq';
import { getRedisConnection } from './redis';
import { DEFAULT_BACKOFF } from './retry-strategy';
import type {
  JobOptions,
  JobStatus,
  AddJobResult,
  QueueJobData,
  QueueMetrics,
} from './types';

export class TaskQueue {
  private queues: Map<string, Queue> = new Map();

  /**
   * Get or create a named queue. Queues are lazy-created on first access.
   * Returns null if Redis is not configured.
   */
  getQueue(name: string): Queue | null {
    if (this.queues.has(name)) return this.queues.get(name)!;

    const connection = getRedisConnection();
    if (!connection) return null;

    const queue = new Queue(name, { connection });
    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Add a job to a named queue with priority, delay, and retry configuration.
   * Also creates a Prisma QueueJob record for audit trail.
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: Record<string, unknown>,
    options: JobOptions
  ): Promise<AddJobResult> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      return { success: false, error: 'Redis not configured. Queue system unavailable.' };
    }

    try {
      // Create Prisma audit record first
      let dbJobId: string | undefined;
      try {
        const prisma = (await import('@/prisma')).default;
        const dbJob = await prisma.queueJob.create({
          data: {
            queue: queueName,
            name: jobName,
            status: options.delay ? 'delayed' : 'waiting',
            priority: options.priority ?? 0,
            payload: data as Record<string, any>,
            maxAttempts: options.attempts ?? 3,
            scheduledFor: options.delay
              ? new Date(Date.now() + options.delay)
              : null,
            userId: options.userId,
          },
        });
        dbJobId = dbJob.id;
      } catch (err: any) {
        console.warn('[TaskQueue] Prisma audit failed (non-blocking):', err.message);
      }

      // Build BullMQ job data
      const jobData: QueueJobData = {
        userId: options.userId,
        payload: data,
        dbJobId,
      };

      // Build BullMQ options
      const backoff = options.backoff ?? DEFAULT_BACKOFF;
      const bullmqOpts: Record<string, unknown> = {
        priority: options.priority ?? 0,
        delay: options.delay ?? 0,
        attempts: options.attempts ?? 3,
        backoff: {
          type: backoff.type,
          delay: backoff.delay,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      };

      const job: Job = await queue.add(jobName, jobData, bullmqOpts);

      return {
        success: true,
        jobId: job.id,
        dbJobId,
      };
    } catch (error: any) {
      console.error(`[TaskQueue] Failed to add job to "${queueName}":`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the status of a specific job by BullMQ job ID.
   */
  async getJobStatus(queueName: string, jobId: string): Promise<JobStatus | null> {
    const queue = this.getQueue(queueName);
    if (!queue) return null;

    try {
      const job = await queue.getJob(jobId);
      if (!job) return null;
      const state = await job.getState();
      return state as JobStatus;
    } catch {
      return null;
    }
  }

  /**
   * List jobs in a queue filtered by status.
   */
  async listJobs(
    queueName: string,
    status: JobStatus,
    start = 0,
    end = 25
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    if (!queue) return [];

    try {
      return await queue.getJobs([status], start, end);
    } catch {
      return [];
    }
  }

  /**
   * Remove a specific job from a queue.
   */
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    const queue = this.getQueue(queueName);
    if (!queue) return false;

    try {
      const job = await queue.getJob(jobId);
      if (!job) return false;
      await job.remove();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pause a queue (no new jobs will be processed).
   */
  async pauseQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    if (queue) await queue.pause();
  }

  /**
   * Resume a paused queue.
   */
  async resumeQueue(name: string): Promise<void> {
    const queue = this.getQueue(name);
    if (queue) await queue.resume();
  }

  /**
   * Get queue depth metrics.
   */
  async getQueueMetrics(name: string): Promise<QueueMetrics> {
    const queue = this.getQueue(name);
    if (!queue) {
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
    }

    try {
      const counts = await queue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed'
      );
      return {
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
      };
    } catch {
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
    }
  }

  /**
   * Close all queue connections for graceful shutdown.
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.queues.values()).map((q) => q.close());
    await Promise.all(promises);
    this.queues.clear();
  }
}

/** Singleton instance */
export const taskQueue = new TaskQueue();
