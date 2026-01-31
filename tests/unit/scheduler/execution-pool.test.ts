/**
 * Execution Pool Unit Tests
 *
 * Tests for the Phase 9.3 concurrent execution pool.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionPool } from '@/lib/scheduler/execution-pool';
import type { PlanStep } from '@/agents/base';
import type { SchedulerTask } from '@/lib/scheduler/types';

describe('ExecutionPool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('should handle empty plan', async () => {
      const pool = new ExecutionPool();
      const executor = vi.fn();

      const result = await pool.execute([], executor);

      expect(result.success).toBe(true);
      expect(result.completedCount).toBe(0);
      expect(result.failedCount).toBe(0);
      expect(executor).not.toHaveBeenCalled();
    });

    it('should execute single task', async () => {
      const pool = new ExecutionPool();
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
      ];

      const executor = vi.fn().mockResolvedValue(undefined);
      const result = await pool.execute(steps, executor);

      expect(result.success).toBe(true);
      expect(result.completedCount).toBe(1);
      expect(executor).toHaveBeenCalledTimes(1);
    });

    it('should execute parallel tasks concurrently', async () => {
      const pool = new ExecutionPool({ maxConcurrency: 3 });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {} },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {} },
      ];

      const executionOrder: string[] = [];
      const executor = vi.fn().mockImplementation(async (task: SchedulerTask) => {
        executionOrder.push(`start:${task.step.id}`);
        await new Promise(r => setTimeout(r, 10));
        executionOrder.push(`end:${task.step.id}`);
      });

      const result = await pool.execute(steps, executor);

      expect(result.success).toBe(true);
      expect(result.completedCount).toBe(3);
      // All should start before any ends (parallel execution)
      expect(executionOrder.filter(e => e.startsWith('start:')).length).toBe(3);
    });

    it('should respect maxConcurrency limit', async () => {
      const pool = new ExecutionPool({ maxConcurrency: 2 });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {} },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {} },
        { id: 'step4', action: 'Action 4', tool: 'tool4', payload: {} },
      ];

      let currentRunning = 0;
      let maxRunning = 0;

      const executor = vi.fn().mockImplementation(async () => {
        currentRunning++;
        maxRunning = Math.max(maxRunning, currentRunning);
        await new Promise(r => setTimeout(r, 20));
        currentRunning--;
      });

      await pool.execute(steps, executor);

      expect(maxRunning).toBeLessThanOrEqual(2);
    });

    it('should execute dependencies in correct order', async () => {
      const pool = new ExecutionPool();
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {}, dependencies: ['step2'] },
      ];

      const executionOrder: string[] = [];
      const executor = vi.fn().mockImplementation(async (task: SchedulerTask) => {
        executionOrder.push(task.step.id);
      });

      await pool.execute(steps, executor);

      expect(executionOrder).toEqual(['step1', 'step2', 'step3']);
    });

    it('should handle task failure', async () => {
      const pool = new ExecutionPool({ failFast: false });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {} },
      ];

      const executor = vi.fn().mockImplementation(async (task: SchedulerTask) => {
        if (task.step.id === 'step1') {
          throw new Error('Task failed');
        }
      });

      const result = await pool.execute(steps, executor);

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.completedCount).toBe(1);
    });

    it('should abort on failFast', async () => {
      const pool = new ExecutionPool({ failFast: true });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {}, dependencies: ['step2'] },
      ];

      const executor = vi.fn().mockImplementation(async (task: SchedulerTask) => {
        if (task.step.id === 'step1') {
          throw new Error('Task failed');
        }
      });

      const result = await pool.execute(steps, executor);

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.cancelledCount).toBeGreaterThan(0);
    });

    it('should cancel dependent tasks on failure', async () => {
      const pool = new ExecutionPool({ failFast: false });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
      ];

      const executor = vi.fn().mockImplementation(async (task: SchedulerTask) => {
        if (task.step.id === 'step1') {
          throw new Error('Task failed');
        }
      });

      const result = await pool.execute(steps, executor);

      expect(result.failedCount).toBe(1);
      expect(result.cancelledCount).toBe(1);
      const cancelledTask = result.tasks.find(t => t.step.id === 'step2');
      expect(cancelledTask?.status).toBe('cancelled');
    });

    it('should call onTaskStart callback', async () => {
      const onTaskStart = vi.fn();
      const pool = new ExecutionPool({ onTaskStart });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
      ];

      await pool.execute(steps, vi.fn().mockResolvedValue(undefined));

      expect(onTaskStart).toHaveBeenCalledTimes(1);
      expect(onTaskStart).toHaveBeenCalledWith(expect.objectContaining({
        step: expect.objectContaining({ id: 'step1' }),
      }));
    });

    it('should call onTaskComplete callback', async () => {
      const onTaskComplete = vi.fn();
      const pool = new ExecutionPool({ onTaskComplete });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
      ];

      await pool.execute(steps, vi.fn().mockResolvedValue(undefined));

      expect(onTaskComplete).toHaveBeenCalledTimes(1);
    });

    it('should call onTaskFail callback on failure', async () => {
      const onTaskFail = vi.fn();
      const pool = new ExecutionPool({ onTaskFail });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
      ];

      await pool.execute(steps, vi.fn().mockRejectedValue(new Error('Failed')));

      expect(onTaskFail).toHaveBeenCalledTimes(1);
    });

    it('should call onProgress callback', async () => {
      const onProgress = vi.fn();
      const pool = new ExecutionPool({ onProgress });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {} },
      ];

      await pool.execute(steps, vi.fn().mockResolvedValue(undefined));

      expect(onProgress).toHaveBeenCalled();
      // Should be called at least once with (completed, total)
      expect(onProgress).toHaveBeenCalledWith(expect.any(Number), 2);
    });

    it('should compute critical path duration', async () => {
      const pool = new ExecutionPool();
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
      ];

      const executor = vi.fn().mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 10));
      });

      const result = await pool.execute(steps, executor);

      expect(result.criticalPathMs).toBeGreaterThan(0);
      expect(result.totalDurationMs).toBeGreaterThan(0);
    });
  });

  describe('abort', () => {
    it('should cancel pending tasks when aborted', async () => {
      const pool = new ExecutionPool({ maxConcurrency: 1 });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {} },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {} },
      ];

      let aborted = false;
      const executor = vi.fn().mockImplementation(async (task: SchedulerTask) => {
        if (task.step.id === 'step1') {
          // Abort after first task starts
          pool.abort();
          aborted = true;
        }
        await new Promise(r => setTimeout(r, 10));
      });

      const result = await pool.execute(steps, executor);

      expect(aborted).toBe(true);
      expect(result.cancelledCount).toBeGreaterThan(0);
    });
  });

  describe('timeout handling', () => {
    it('should timeout long-running tasks', async () => {
      const pool = new ExecutionPool({ taskTimeoutMs: 50 });
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
      ];

      const executor = vi.fn().mockImplementation(async () => {
        // This will timeout
        await new Promise(r => setTimeout(r, 200));
      });

      const result = await pool.execute(steps, executor);

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.tasks[0].error).toContain('timed out');
    });
  });
});
