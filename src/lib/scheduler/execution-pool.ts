/**
 * Phase 9.3: Concurrent Execution Pool
 *
 * Runs scheduler tasks with bounded parallelism using a ready-queue approach.
 * After each task completes, all tasks whose dependencies are now satisfied
 * become "ready" and are scheduled immediately — maximizing parallelism.
 *
 * Features:
 * - Configurable concurrency limit (default: 4)
 * - Per-task timeout with Promise.race
 * - Transitive cancellation on failure (non-failFast)
 * - Deadlock detection (no running tasks but unsettled work remains)
 * - Actual critical path measurement via DP
 * - Abort support for mission-level failure
 */

import type { PlanStep } from '@/agents/base';
import type {
  SchedulerTask,
  SchedulerConfig,
  SchedulerResult,
} from './types';
import { DAGScheduler } from './dag-scheduler';

type TaskExecutor = (task: SchedulerTask) => Promise<void>;

export class ExecutionPool {
  private config: {
    maxConcurrency: number;
    taskTimeoutMs: number;
    failFast: boolean;
    onTaskStart?: SchedulerConfig['onTaskStart'];
    onTaskComplete?: SchedulerConfig['onTaskComplete'];
    onTaskFail?: SchedulerConfig['onTaskFail'];
    onProgress?: SchedulerConfig['onProgress'];
  };

  private tasks: Map<string, SchedulerTask> = new Map();
  private running: Set<string> = new Set();
  private completedCount = 0;
  private failedCount = 0;
  private cancelledCount = 0;
  private aborted = false;
  private drainResolve?: () => void;
  private totalTasks = 0;
  private executor?: TaskExecutor;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency ?? 4,
      taskTimeoutMs: config.taskTimeoutMs ?? 300_000,
      failFast: config.failFast ?? false,
      onTaskStart: config.onTaskStart,
      onTaskComplete: config.onTaskComplete,
      onTaskFail: config.onTaskFail,
      onProgress: config.onProgress,
    };
  }

  /**
   * Execute all steps using the DAG scheduler with bounded concurrency.
   *
   * @param steps - The PlanStep array from an AgentPlan
   * @param executor - A function that runs a single task (provided by the overseer)
   * @returns SchedulerResult with outcome of all tasks
   */
  async execute(
    steps: PlanStep[],
    executor: TaskExecutor
  ): Promise<SchedulerResult> {
    const startTime = Date.now();

    // Handle empty plan
    if (steps.length === 0) {
      return {
        success: true,
        tasks: [],
        completedCount: 0,
        failedCount: 0,
        cancelledCount: 0,
        totalDurationMs: 0,
        criticalPathMs: 0,
      };
    }

    // Build DAG (may throw DAGSchedulerError on cycles)
    const levels = DAGScheduler.buildExecutionLevels(steps);
    const allTasks = DAGScheduler.flattenTasks(levels);

    // Reset state
    this.tasks.clear();
    this.running.clear();
    this.completedCount = 0;
    this.failedCount = 0;
    this.cancelledCount = 0;
    this.aborted = false;
    this.totalTasks = allTasks.length;
    this.executor = executor;

    for (const task of allTasks) {
      this.tasks.set(task.step.id, task);
    }

    // Run the scheduling loop
    await this.runSchedulingLoop();

    // Compute actual critical path duration
    const criticalPathMs = this.computeActualCriticalPath();

    return {
      success: this.failedCount === 0,
      tasks: Array.from(this.tasks.values()),
      completedCount: this.completedCount,
      failedCount: this.failedCount,
      cancelledCount: this.cancelledCount,
      totalDurationMs: Date.now() - startTime,
      criticalPathMs,
    };
  }

  /**
   * Abort all pending/ready tasks. Running tasks complete naturally
   * but no new tasks will start.
   */
  abort(): void {
    this.aborted = true;
    for (const task of this.tasks.values()) {
      if (task.status === 'pending' || task.status === 'ready') {
        task.status = 'cancelled';
        this.cancelledCount++;
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // Internal scheduling
  // ────────────────────────────────────────────────────────────────────

  private async runSchedulingLoop(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.drainResolve = resolve;
      this.scheduleReady();
    });
  }

  /**
   * Find all "ready" tasks and start as many as the concurrency limit allows.
   * Called initially and after each task completes or fails.
   */
  private scheduleReady(): void {
    if (this.aborted) {
      this.checkDone();
      return;
    }

    // Promote pending tasks whose dependencies are all met
    const readyTasks: SchedulerTask[] = [];
    for (const task of this.tasks.values()) {
      if (task.status === 'pending' && this.areDependenciesMet(task)) {
        task.status = 'ready';
      }
      if (task.status === 'ready') {
        readyTasks.push(task);
      }
    }

    // Sort by priority (ascending = highest priority first)
    readyTasks.sort((a, b) => a.priority - b.priority);

    // Start tasks up to concurrency limit
    for (const task of readyTasks) {
      if (this.running.size >= this.config.maxConcurrency) break;
      this.startTask(task);
    }

    // Check if everything is settled
    this.checkDone();
  }

  private startTask(task: SchedulerTask): void {
    task.status = 'running';
    task.startedAt = Date.now();
    this.running.add(task.step.id);

    // Fire onTaskStart callback (non-blocking)
    try {
      this.config.onTaskStart?.(task);
    } catch {
      // Callback errors don't affect task execution
    }

    // Create timeout race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `Task ${task.step.id} timed out after ${this.config.taskTimeoutMs}ms`
            )
          ),
        this.config.taskTimeoutMs
      );
    });

    // Execute with timeout
    Promise.race([this.executor!(task), timeoutPromise])
      .then(() => {
        task.status = 'completed';
        task.completedAt = Date.now();
        this.completedCount++;
        this.running.delete(task.step.id);

        try {
          this.config.onTaskComplete?.(task);
        } catch {
          // Callback errors don't affect scheduling
        }

        try {
          this.config.onProgress?.(
            this.completedCount + this.failedCount,
            this.totalTasks
          );
        } catch {
          // Callback errors don't affect scheduling
        }

        // Schedule more tasks now that this one completed
        this.scheduleReady();
      })
      .catch((err: Error) => {
        task.status = 'failed';
        task.error = err.message;
        task.completedAt = Date.now();
        this.failedCount++;
        this.running.delete(task.step.id);

        try {
          this.config.onTaskFail?.(task);
        } catch {
          // Callback errors don't affect scheduling
        }

        try {
          this.config.onProgress?.(
            this.completedCount + this.failedCount,
            this.totalTasks
          );
        } catch {
          // Callback errors don't affect scheduling
        }

        if (this.config.failFast) {
          this.abort();
        } else {
          // Cancel tasks that transitively depend on the failed task
          this.cancelDependents(task.step.id);
        }

        this.scheduleReady();
      });
  }

  private areDependenciesMet(task: SchedulerTask): boolean {
    const deps = task.step.dependencies ?? [];
    for (const depId of deps) {
      const depTask = this.tasks.get(depId);
      // Missing dep treated as satisfied (handles partial plans)
      if (!depTask) continue;
      if (depTask.status !== 'completed') return false;
    }
    return true;
  }

  /**
   * Cancel all tasks that transitively depend on a failed task.
   */
  private cancelDependents(failedId: string): void {
    for (const task of this.tasks.values()) {
      if (task.status === 'pending' || task.status === 'ready') {
        if (this.dependsOn(task, failedId)) {
          task.status = 'cancelled';
          task.error = `Cancelled: dependency ${failedId} failed`;
          this.cancelledCount++;
        }
      }
    }
  }

  /**
   * Check if a task transitively depends on targetId.
   */
  private dependsOn(
    task: SchedulerTask,
    targetId: string,
    visited = new Set<string>()
  ): boolean {
    if (visited.has(task.step.id)) return false;
    visited.add(task.step.id);

    for (const depId of task.step.dependencies ?? []) {
      if (depId === targetId) return true;
      const depTask = this.tasks.get(depId);
      if (depTask && this.dependsOn(depTask, targetId, visited)) return true;
    }
    return false;
  }

  /**
   * Check if all tasks are settled. Includes deadlock detection:
   * if no tasks are running but unsettled tasks remain, mark them as cancelled.
   */
  private checkDone(): void {
    const settledCount =
      this.completedCount + this.failedCount + this.cancelledCount;

    if (settledCount >= this.totalTasks) {
      // All tasks are settled
      this.drainResolve?.();
      return;
    }

    if (this.running.size === 0) {
      // Deadlock: no tasks running but not all settled
      // Mark remaining pending/ready tasks as cancelled
      for (const task of this.tasks.values()) {
        if (task.status === 'pending' || task.status === 'ready') {
          task.status = 'cancelled';
          task.error = 'Deadlock: no runnable tasks remain';
          this.cancelledCount++;
        }
      }
      this.drainResolve?.();
    }
  }

  /**
   * Compute the actual wall-clock time of the critical path.
   * Uses DP to find the longest chain of sequential tasks
   * by actual measured duration.
   */
  private computeActualCriticalPath(): number {
    const memo = new Map<string, number>();

    const longestTo = (id: string): number => {
      if (memo.has(id)) return memo.get(id)!;
      const task = this.tasks.get(id);
      if (!task || task.status !== 'completed') {
        memo.set(id, 0);
        return 0;
      }

      const taskDuration = (task.completedAt ?? 0) - (task.startedAt ?? 0);
      let maxPredecessor = 0;

      for (const depId of task.step.dependencies ?? []) {
        maxPredecessor = Math.max(maxPredecessor, longestTo(depId));
      }

      const total = maxPredecessor + taskDuration;
      memo.set(id, total);
      return total;
    };

    let criticalPath = 0;
    for (const id of this.tasks.keys()) {
      criticalPath = Math.max(criticalPath, longestTo(id));
    }
    return criticalPath;
  }
}
