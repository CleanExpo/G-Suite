/**
 * UNI-167: Task Queue & Scheduling System — Barrel Exports
 *
 * Usage:
 *   import { taskQueue, jobProcessor, cronScheduler, deadLetterQueue } from '@/lib/queue';
 */

// Types
export type {
  JobStatus,
  BackoffStrategy,
  JobOptions,
  QueueJobData,
  QueueConfig,
  AddJobResult,
  DeadLetterInfo,
  QueueMetrics,
} from './types';

// Redis
export { getRedisConnection, isRedisAvailable, closeRedisConnection } from './redis';

// Retry strategy
export { computeBackoffDelay, shouldRetry, DEFAULT_BACKOFF } from './retry-strategy';

// Queue manager
export { taskQueue, TaskQueue } from './task-queue';

// Job processor
export { jobProcessor, JobProcessor } from './job-processor';

// Dead letter queue
export { deadLetterQueue, DeadLetterQueue } from './dead-letter';

// Cron scheduler
export { cronScheduler, CronScheduler } from './cron-scheduler';
