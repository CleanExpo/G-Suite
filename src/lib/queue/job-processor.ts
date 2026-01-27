/**
 * UNI-167: Job Processor — BullMQ Worker Bridge
 *
 * Registers BullMQ Workers that process queued jobs.
 * Bridges to the existing agent system (LangGraph workflow, AgentRegistry).
 *
 * Built-in processors:
 * - "missions" queue: Invokes the LangGraph workflow
 * - "agents" queue: Runs a single agent plan/execute/verify lifecycle
 *
 * Lifecycle hooks sync job status to Prisma QueueJob records.
 */

import { Worker, type Job } from 'bullmq';
import { getRedisConnection } from './redis';
import { shouldRetry } from './retry-strategy';
import type { QueueJobData } from './types';

type ProcessorHandler = (job: Job<QueueJobData>) => Promise<unknown>;

export class JobProcessor {
  private workers: Map<string, Worker> = new Map();

  /**
   * Register a worker for a named queue.
   * The handler receives a BullMQ Job and should return a result or throw.
   */
  registerProcessor(
    queueName: string,
    handler: ProcessorHandler,
    concurrency = 3
  ): void {
    const connection = getRedisConnection();
    if (!connection) {
      console.warn(`[JobProcessor] Cannot register processor for "${queueName}": Redis not configured.`);
      return;
    }

    if (this.workers.has(queueName)) {
      console.warn(`[JobProcessor] Worker for "${queueName}" already registered. Skipping.`);
      return;
    }

    const worker = new Worker<QueueJobData>(
      queueName,
      async (job) => {
        console.log(`[JobProcessor] Processing job ${job.id} on queue "${queueName}"`);
        return handler(job);
      },
      { connection, concurrency }
    );

    // Lifecycle hooks — sync to Prisma
    worker.on('active', (job: Job<QueueJobData>) => {
      this.syncJobStatus(job, 'active').catch(() => {});
      // UNI-168: Update agent status
      this.updateAgentStatusOnActive(job).catch(() => {});
    });

    worker.on('completed', (job: Job<QueueJobData>, result: unknown) => {
      this.syncJobCompleted(job, result).catch(() => {});
      // UNI-168: Update agent status to idle
      this.updateAgentStatusOnCompleted(job).catch(() => {});
    });

    worker.on('failed', (job: Job<QueueJobData> | undefined, error: Error) => {
      if (job) {
        this.handleJobFailure(job, error).catch(() => {});
        // UNI-168: Track agent failure
        this.updateAgentStatusOnFailed(job).catch(() => {});
      }
    });

    worker.on('error', (err) => {
      console.error(`[JobProcessor] Worker error on "${queueName}":`, err.message);
    });

    this.workers.set(queueName, worker);
    console.log(`[JobProcessor] Registered processor for "${queueName}" (concurrency: ${concurrency})`);
  }

  /**
   * Register the built-in "missions" processor.
   * Invokes the LangGraph workflow for mission execution.
   */
  async registerMissionsProcessor(concurrency = 2): Promise<void> {
    this.registerProcessor('missions', async (job) => {
      const { userId, payload } = job.data;
      const description = payload.description as string;

      if (!description) throw new Error('Mission description is required');

      // Dynamic import to avoid circular dependencies at module load
      const { app: workflow } = await import('@/graph/workflow');

      console.log(`[JobProcessor:missions] Executing mission for ${userId}`);

      const result = await workflow.invoke({
        userRequest: description,
        userId,
        status: 'starting',
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return {
        success: true,
        results: result.results,
        status: result.status,
      };
    }, concurrency);
  }

  /**
   * Register the built-in "agents" processor.
   * Runs a single agent's plan/execute/verify lifecycle.
   */
  async registerAgentsProcessor(concurrency = 3): Promise<void> {
    this.registerProcessor('agents', async (job) => {
      const { userId, payload } = job.data;
      const agentName = payload.agentName as string;
      const mission = payload.mission as string;

      if (!agentName) throw new Error('Agent name is required');
      if (!mission) throw new Error('Mission description is required');

      // Dynamic import to avoid circular dependencies
      const { AgentRegistry, initializeAgents } = await import('@/agents/registry');
      await initializeAgents();

      const agent = AgentRegistry.get(agentName);
      if (!agent) throw new Error(`Agent "${agentName}" not found in registry`);

      const context = {
        mission,
        userId,
        config: payload.config as Record<string, unknown> || {},
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      return result;
    }, concurrency);
  }

  // ===========================================================================
  // Prisma Status Sync
  // ===========================================================================

  private async syncJobStatus(job: Job<QueueJobData>, status: string): Promise<void> {
    const dbJobId = job.data?.dbJobId;
    if (!dbJobId) return;

    try {
      const prisma = (await import('@/prisma')).default;
      await prisma.queueJob.update({
        where: { id: dbJobId },
        data: {
          status,
          startedAt: status === 'active' ? new Date() : undefined,
          attempts: job.attemptsMade,
        },
      });
    } catch (err: any) {
      console.warn('[JobProcessor] Prisma sync failed (non-blocking):', err.message);
    }
  }

  private async syncJobCompleted(job: Job<QueueJobData>, result: unknown): Promise<void> {
    const dbJobId = job.data?.dbJobId;
    if (!dbJobId) return;

    try {
      const prisma = (await import('@/prisma')).default;
      await prisma.queueJob.update({
        where: { id: dbJobId },
        data: {
          status: 'completed',
          result: result as any,
          completedAt: new Date(),
          attempts: job.attemptsMade,
        },
      });
    } catch (err: any) {
      console.warn('[JobProcessor] Prisma sync failed (non-blocking):', err.message);
    }
  }

  private async handleJobFailure(job: Job<QueueJobData>, error: Error): Promise<void> {
    const dbJobId = job.data?.dbJobId;
    const maxAttempts = (job.opts?.attempts as number) ?? 3;
    const isExhausted = !shouldRetry(job.attemptsMade, maxAttempts);

    // Sync status to Prisma
    if (dbJobId) {
      try {
        const prisma = (await import('@/prisma')).default;
        await prisma.queueJob.update({
          where: { id: dbJobId },
          data: {
            status: 'failed',
            error: error.message,
            attempts: job.attemptsMade,
            completedAt: isExhausted ? new Date() : undefined,
          },
        });
      } catch (err: any) {
        console.warn('[JobProcessor] Prisma sync failed (non-blocking):', err.message);
      }
    }

    // If max attempts exhausted, move to dead letter queue
    if (isExhausted) {
      try {
        const { deadLetterQueue } = await import('./dead-letter');
        await deadLetterQueue.addEntry(
          job.queueName,
          job.name,
          job.id ?? '',
          job.data?.payload ?? {},
          error.message,
          job.attemptsMade,
          job.data?.userId ?? 'unknown'
        );
        console.log(`[JobProcessor] Job ${job.id} moved to dead letter queue after ${job.attemptsMade} attempts`);
      } catch (dlqErr: any) {
        console.error('[JobProcessor] DLQ insertion failed:', dlqErr.message);
      }
    }
  }

  // ===========================================================================
  // UNI-168: Agent Status Monitoring Hooks
  // ===========================================================================

  private async updateAgentStatusOnActive(job: Job<QueueJobData>): Promise<void> {
    try {
      const { updateAgentStatus } = await import('@/lib/monitoring');
      const agentName = job.data?.payload?.agentName as string | undefined;
      const userId = job.data?.userId;

      if (agentName && userId) {
        await updateAgentStatus(agentName, 'active', job.id, userId);
      }
    } catch (err: any) {
      console.warn('[JobProcessor] Agent status update failed (non-blocking):', err.message);
    }
  }

  private async updateAgentStatusOnCompleted(job: Job<QueueJobData>): Promise<void> {
    try {
      const { updateAgentStatus, updateAgentPerformanceMetrics } = await import('@/lib/monitoring');
      const agentName = job.data?.payload?.agentName as string | undefined;
      const userId = job.data?.userId;

      if (agentName && userId) {
        // Update status to idle
        await updateAgentStatus(agentName, 'idle', undefined, userId);

        // Update performance metrics if we have timing data
        if (job.finishedOn && job.processedOn) {
          const duration = job.finishedOn - job.processedOn;
          await updateAgentPerformanceMetrics(agentName, userId, duration);
        }
      }
    } catch (err: any) {
      console.warn('[JobProcessor] Agent status update failed (non-blocking):', err.message);
    }
  }

  private async updateAgentStatusOnFailed(job: Job<QueueJobData>): Promise<void> {
    try {
      const { incrementAgentFailureCount } = await import('@/lib/monitoring');
      const agentName = job.data?.payload?.agentName as string | undefined;
      const userId = job.data?.userId;

      if (agentName && userId) {
        await incrementAgentFailureCount(agentName, userId);
      }
    } catch (err: any) {
      console.warn('[JobProcessor] Agent failure tracking failed (non-blocking):', err.message);
    }
  }

  /**
   * Close all workers for graceful shutdown.
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.workers.values()).map((w) => w.close());
    await Promise.all(promises);
    this.workers.clear();
  }
}

/** Singleton instance */
export const jobProcessor = new JobProcessor();
