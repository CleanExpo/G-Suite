/**
 * Phase 9.3: DAG-based Dependency Resolution Scheduler
 *
 * Implements topological sort via Kahn's algorithm to produce execution levels
 * from PlanStep arrays. Detects cycles, computes critical path weights, and
 * assigns priority ordering for optimal parallel execution.
 *
 * Time complexity: O(V + E) where V = steps and E = dependency edges.
 */

import type { PlanStep } from '@/agents/base';
import type { SchedulerTask, ExecutionLevel } from './types';

export class DAGSchedulerError extends Error {
  constructor(
    message: string,
    public readonly involvedSteps?: string[],
  ) {
    super(message);
    this.name = 'DAGSchedulerError';
  }
}

export class DAGScheduler {
  /**
   * Build a DAG from PlanSteps, detect cycles, compute levels and critical path.
   * Returns ExecutionLevel[] ordered from level 0 (root tasks) upward.
   *
   * @throws DAGSchedulerError if a circular dependency is detected.
   */
  static buildExecutionLevels(steps: PlanStep[]): ExecutionLevel[] {
    if (steps.length === 0) return [];

    // 1. Index steps by id
    const stepMap = new Map<string, PlanStep>();
    for (const step of steps) {
      stepMap.set(step.id, step);
    }

    // 2. Build adjacency lists and in-degree counts for Kahn's algorithm
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>(); // stepId → IDs that depend on it

    for (const step of steps) {
      if (!inDegree.has(step.id)) inDegree.set(step.id, 0);
      if (!dependents.has(step.id)) dependents.set(step.id, []);

      for (const depId of step.dependencies ?? []) {
        // Skip references to non-existent steps (handles partial plans during retries)
        if (!stepMap.has(depId)) continue;

        inDegree.set(step.id, (inDegree.get(step.id) ?? 0) + 1);
        if (!dependents.has(depId)) dependents.set(depId, []);
        dependents.get(depId)!.push(step.id);
      }
    }

    // 3. BFS topological sort with level tracking
    const levels = new Map<string, number>();
    const queue: { id: string; level: number }[] = [];

    for (const step of steps) {
      if ((inDegree.get(step.id) ?? 0) === 0) {
        queue.push({ id: step.id, level: 0 });
        levels.set(step.id, 0);
      }
    }

    let processed = 0;
    let head = 0;

    while (head < queue.length) {
      const { id, level } = queue[head++];
      processed++;

      for (const depId of dependents.get(id) ?? []) {
        const newDeg = (inDegree.get(depId) ?? 1) - 1;
        inDegree.set(depId, newDeg);

        // Level = max of all predecessors' levels + 1
        const depLevel = Math.max(levels.get(depId) ?? 0, level + 1);
        levels.set(depId, depLevel);

        if (newDeg === 0) {
          queue.push({ id: depId, level: depLevel });
        }
      }
    }

    // 4. Cycle detection: if not all steps were processed, a cycle exists
    if (processed < steps.length) {
      const cycleSteps = steps.filter((s) => !queue.some((q) => q.id === s.id)).map((s) => s.id);
      throw new DAGSchedulerError(
        `Circular dependency detected among steps: ${cycleSteps.join(', ')}`,
        cycleSteps,
      );
    }

    // 5. Compute critical path weights bottom-up
    //    Leaf nodes = 1, predecessors = 1 + max(children's weights)
    const criticalWeight = new Map<string, number>();
    const topoOrder = queue.map((q) => q.id);

    for (let i = topoOrder.length - 1; i >= 0; i--) {
      const id = topoOrder[i];
      let maxChildWeight = 0;
      for (const childId of dependents.get(id) ?? []) {
        maxChildWeight = Math.max(maxChildWeight, criticalWeight.get(childId) ?? 0);
      }
      criticalWeight.set(id, 1 + maxChildWeight);
    }

    // 6. Group into execution levels with SchedulerTask wrappers
    const levelGroups = new Map<number, SchedulerTask[]>();
    const maxLevel = Math.max(...Array.from(levels.values()), 0);

    for (const step of steps) {
      const level = levels.get(step.id) ?? 0;
      const task: SchedulerTask = {
        step,
        status: level === 0 ? 'ready' : 'pending',
        priority: this.computePriority(step, level, criticalWeight.get(step.id) ?? 0),
        level,
        criticalPathWeight: criticalWeight.get(step.id) ?? 0,
      };

      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(task);
    }

    // 7. Sort tasks within each level by priority (ascending = higher priority first)
    const executionLevels: ExecutionLevel[] = [];
    for (let l = 0; l <= maxLevel; l++) {
      const tasks = levelGroups.get(l) ?? [];
      tasks.sort((a, b) => a.priority - b.priority);
      executionLevels.push({ level: l, tasks });
    }

    return executionLevels;
  }

  /**
   * Flatten execution levels into a single ordered task list.
   * Useful for progress tracking (task N of M).
   */
  static flattenTasks(levels: ExecutionLevel[]): SchedulerTask[] {
    return levels.flatMap((l) => l.tasks);
  }

  /**
   * Compute priority for a task. Lower number = higher priority.
   *
   * Factors (weighted):
   * - Critical path position: tasks on longer chains scheduled first
   * - Audit/verifier steps get priority boost within their level
   * - Step ID hash as stable tiebreaker
   */
  private static computePriority(
    step: PlanStep,
    _level: number,
    criticalPathWeight: number,
  ): number {
    let priority = 0;

    // Critical path: higher weight → should run first → lower priority number
    // Invert: max expected weight is ~20, subtract from 20
    priority += (20 - Math.min(criticalPathWeight, 20)) * 10;

    // Audit steps get a boost (lower priority number = runs first within level)
    if (step.tool.startsWith('audit:')) {
      priority -= 100;
    }

    // Stable tiebreaker from step ID
    const hash = step.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    priority += hash % 10;

    return priority;
  }
}
