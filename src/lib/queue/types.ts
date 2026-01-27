/**
 * UNI-167: Task Queue & Scheduling System — Type Definitions
 *
 * Types consumed by the queue manager, job processor, DLQ, and cron scheduler.
 */

// =============================================================================
// JOB STATUS
// =============================================================================

/** Job status matching BullMQ lifecycle */
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

// =============================================================================
// BACKOFF & RETRY
// =============================================================================

/** Backoff strategy for retries */
export interface BackoffStrategy {
  type: 'exponential' | 'fixed';
  /** Base delay in milliseconds */
  delay: number;
  /** Maximum delay cap for exponential backoff (default: 60_000) */
  maxDelay?: number;
  /** Add randomized jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
}

// =============================================================================
// JOB OPTIONS
// =============================================================================

/** Configuration when creating a job */
export interface JobOptions {
  /** Lower number = higher priority (BullMQ convention: 0 is highest) */
  priority?: number;
  /** Milliseconds to wait before processing */
  delay?: number;
  /** Max retry attempts (default: 3) */
  attempts?: number;
  /** Retry backoff strategy */
  backoff?: BackoffStrategy;
  /** Per-job timeout in milliseconds */
  timeout?: number;
  /** User who submitted this job */
  userId: string;
}

// =============================================================================
// JOB DATA
// =============================================================================

/** Internal wrapper for job data stored in BullMQ */
export interface QueueJobData {
  userId: string;
  payload: Record<string, unknown>;
  /** Prisma QueueJob ID for status synchronization */
  dbJobId?: string;
}

// =============================================================================
// QUEUE CONFIGURATION
// =============================================================================

/** Configuration for a named queue */
export interface QueueConfig {
  name: string;
  defaultJobOptions?: Partial<JobOptions>;
  /** Worker concurrency for this queue (default: 3) */
  concurrency?: number;
}

// =============================================================================
// RESULTS
// =============================================================================

/** Result of adding a job to the queue */
export interface AddJobResult {
  success: boolean;
  /** BullMQ job ID */
  jobId?: string;
  /** Prisma QueueJob record ID */
  dbJobId?: string;
  error?: string;
}

// =============================================================================
// DEAD LETTER
// =============================================================================

/** Dead letter entry for API responses */
export interface DeadLetterInfo {
  id: string;
  queue: string;
  jobName: string;
  payload: Record<string, unknown>;
  error: string;
  attempts: number;
  failedAt: string;
}

// =============================================================================
// QUEUE METRICS
// =============================================================================

/** Queue depth metrics */
export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}
