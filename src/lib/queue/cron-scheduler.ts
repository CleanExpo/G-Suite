/**
 * UNI-167: Cron Scheduler
 *
 * Manages repeatable cron jobs using BullMQ's `repeat` option.
 * Persists cron schedules to Prisma for visibility and management.
 *
 * Capabilities:
 * - Add/remove/toggle repeatable cron jobs
 * - List active schedules
 * - Validate cron patterns
 * - Track last/next run times
 */

import { getRedisConnection } from './redis';
import { taskQueue } from './task-queue';

/** Cron field ranges for validation */
const CRON_FIELD_RANGES = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'day of week', min: 0, max: 7 },
] as const;

export class CronScheduler {
  /**
   * Add a repeatable cron job.
   * Creates both a BullMQ repeatable job and a Prisma CronSchedule record.
   */
  async addCronJob(
    name: string,
    pattern: string,
    queueName: string,
    jobName: string,
    payload: Record<string, unknown>,
    userId: string
  ): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
    // Validate cron pattern
    if (!CronScheduler.isValidPattern(pattern)) {
      return { success: false, error: `Invalid cron pattern: "${pattern}"` };
    }

    const connection = getRedisConnection();
    if (!connection) {
      return { success: false, error: 'Redis not configured. Cron scheduling unavailable.' };
    }

    try {
      // Add repeatable job to BullMQ queue
      const queue = taskQueue.getQueue(queueName);
      if (!queue) {
        return { success: false, error: `Failed to access queue "${queueName}"` };
      }

      await queue.add(
        jobName,
        { userId, payload, dbJobId: undefined },
        {
          repeat: { pattern },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        }
      );

      // Persist to Prisma
      let scheduleId: string | undefined;
      try {
        const prisma = (await import('@/prisma')).default;
        const schedule = await prisma.cronSchedule.upsert({
          where: {
            name_userId: { name, userId },
          },
          update: {
            pattern,
            queue: queueName,
            jobName,
            payload: payload as Record<string, any>,
            isActive: true,
            nextRunAt: this.computeNextRun(pattern),
          },
          create: {
            name,
            pattern,
            queue: queueName,
            jobName,
            payload: payload as Record<string, any>,
            isActive: true,
            nextRunAt: this.computeNextRun(pattern),
            userId,
          },
        });
        scheduleId = schedule.id;
      } catch (err: any) {
        console.warn('[CronScheduler] Prisma persist failed (non-blocking):', err.message);
      }

      console.log(`[CronScheduler] Added cron job "${name}" (${pattern}) on queue "${queueName}"`);
      return { success: true, scheduleId };
    } catch (error: any) {
      console.error('[CronScheduler] Failed to add cron job:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove a cron schedule by its Prisma ID.
   * Removes the BullMQ repeatable job and the Prisma record.
   */
  async removeCronJob(scheduleId: string): Promise<boolean> {
    try {
      const prisma = (await import('@/prisma')).default;
      const schedule = await prisma.cronSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) return false;

      // Remove from BullMQ
      const queue = taskQueue.getQueue(schedule.queue);
      if (queue) {
        const repeatableJobs = await queue.getRepeatableJobs();
        for (const rj of repeatableJobs) {
          if (rj.pattern === schedule.pattern && rj.name === schedule.jobName) {
            await queue.removeRepeatableByKey(rj.key);
          }
        }
      }

      // Remove from Prisma
      await prisma.cronSchedule.delete({ where: { id: scheduleId } });

      console.log(`[CronScheduler] Removed cron schedule ${scheduleId}`);
      return true;
    } catch (err: any) {
      console.error('[CronScheduler] Remove failed:', err.message);
      return false;
    }
  }

  /**
   * List cron schedules, optionally filtered by userId.
   */
  async listSchedules(userId?: string): Promise<Array<{
    id: string;
    name: string;
    pattern: string;
    queue: string;
    jobName: string;
    isActive: boolean;
    nextRunAt: string | null;
    lastRunAt: string | null;
  }>> {
    try {
      const prisma = (await import('@/prisma')).default;
      const schedules = await prisma.cronSchedule.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
      });

      return schedules.map((s) => ({
        id: s.id,
        name: s.name,
        pattern: s.pattern,
        queue: s.queue,
        jobName: s.jobName,
        isActive: s.isActive,
        nextRunAt: s.nextRunAt?.toISOString() ?? null,
        lastRunAt: s.lastRunAt?.toISOString() ?? null,
      }));
    } catch (err: any) {
      console.error('[CronScheduler] List failed:', err.message);
      return [];
    }
  }

  /**
   * Toggle a cron schedule active/inactive.
   * When deactivated, removes the BullMQ repeatable job but keeps the Prisma record.
   * When reactivated, re-adds the BullMQ repeatable job.
   */
  async toggleSchedule(scheduleId: string, isActive: boolean): Promise<void> {
    try {
      const prisma = (await import('@/prisma')).default;
      const schedule = await prisma.cronSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) return;

      const queue = taskQueue.getQueue(schedule.queue);

      if (!isActive && queue) {
        // Deactivate: remove from BullMQ
        const repeatableJobs = await queue.getRepeatableJobs();
        for (const rj of repeatableJobs) {
          if (rj.pattern === schedule.pattern && rj.name === schedule.jobName) {
            await queue.removeRepeatableByKey(rj.key);
          }
        }
      } else if (isActive && queue) {
        // Reactivate: add back to BullMQ
        await queue.add(
          schedule.jobName,
          { userId: schedule.userId, payload: schedule.payload, dbJobId: undefined },
          {
            repeat: { pattern: schedule.pattern },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 500 },
          }
        );
      }

      await prisma.cronSchedule.update({
        where: { id: scheduleId },
        data: {
          isActive,
          nextRunAt: isActive ? this.computeNextRun(schedule.pattern) : null,
        },
      });

      console.log(`[CronScheduler] Schedule ${scheduleId} ${isActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      console.error('[CronScheduler] Toggle failed:', err.message);
    }
  }

  /**
   * Validate a cron expression (standard 5-field format).
   * Supports: numbers, ranges (1-5), steps (asterisk/5), lists (1,3,5), wildcards (*).
   */
  static isValidPattern(pattern: string): boolean {
    const fields = pattern.trim().split(/\s+/);
    if (fields.length !== 5) return false;

    for (let i = 0; i < 5; i++) {
      if (!CronScheduler.isValidField(fields[i], CRON_FIELD_RANGES[i])) {
        return false;
      }
    }

    return true;
  }

  private static isValidField(
    field: string,
    range: (typeof CRON_FIELD_RANGES)[number]
  ): boolean {
    // Wildcard
    if (field === '*') return true;

    // Step values: */5 or 1-10/2
    if (field.includes('/')) {
      const [base, step] = field.split('/');
      const stepNum = parseInt(step, 10);
      if (isNaN(stepNum) || stepNum < 1) return false;
      if (base === '*') return true;
      return CronScheduler.isValidField(base, range);
    }

    // List: 1,3,5
    if (field.includes(',')) {
      return field.split(',').every((part) =>
        CronScheduler.isValidField(part.trim(), range)
      );
    }

    // Range: 1-5
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return (
        !isNaN(start) &&
        !isNaN(end) &&
        start >= range.min &&
        end <= range.max &&
        start <= end
      );
    }

    // Single number
    const num = parseInt(field, 10);
    return !isNaN(num) && num >= range.min && num <= range.max;
  }

  /**
   * Compute approximate next run time for a cron pattern.
   * Simplified: returns a rough estimate rather than exact cron computation.
   */
  private computeNextRun(pattern: string): Date {
    // For a production system, use a cron parser library.
    // This simplified version just returns "next minute" as a placeholder.
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() + 1);
    return now;
  }
}

/** Singleton instance */
export const cronScheduler = new CronScheduler();
