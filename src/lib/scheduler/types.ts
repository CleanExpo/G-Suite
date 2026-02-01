/**
 * Phase 9.3: Parallel Agent Execution Scheduler — Type Definitions
 *
 * Types consumed by the DAG scheduler and execution pool.
 */

import type { PlanStep, AgentResult } from '@/agents/base';

/** Status of a task within the scheduler */
export type SchedulerTaskStatus =
  | 'pending' // waiting for dependencies
  | 'ready' // all deps satisfied, queued for execution
  | 'running' // currently executing
  | 'completed' // finished successfully
  | 'failed' // finished with error
  | 'cancelled'; // aborted due to mission failure or dependency failure

/** A scheduler-level wrapper around a PlanStep */
export interface SchedulerTask {
  step: PlanStep;
  status: SchedulerTaskStatus;
  priority: number; // lower = higher priority (0 is highest)
  level: number; // DAG level (0 = root tasks, 1 = depends on level 0, etc.)
  criticalPathWeight: number; // estimated path length from this node to deepest leaf
  result?: AgentResult;
  error?: string;
  startedAt?: number; // Date.now() timestamp
  completedAt?: number;
}

/** Configuration for the scheduler */
export interface SchedulerConfig {
  maxConcurrency: number; // max parallel workers (default: 4)
  taskTimeoutMs: number; // per-task timeout (default: 300_000 = 5 min)
  failFast: boolean; // abort remaining tasks on first failure (default: false)
  onTaskStart?: (task: SchedulerTask) => void | Promise<void>;
  onTaskComplete?: (task: SchedulerTask) => void | Promise<void>;
  onTaskFail?: (task: SchedulerTask) => void | Promise<void>;
  onProgress?: (completed: number, total: number) => void | Promise<void>;
}

/** Result of a full scheduler run */
export interface SchedulerResult {
  success: boolean;
  tasks: SchedulerTask[];
  completedCount: number;
  failedCount: number;
  cancelledCount: number;
  totalDurationMs: number;
  criticalPathMs: number; // actual duration of the critical path
}

/** An execution level: a set of tasks that can run in parallel */
export interface ExecutionLevel {
  level: number;
  tasks: SchedulerTask[];
}
