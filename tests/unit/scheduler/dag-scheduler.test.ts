/**
 * DAG Scheduler Unit Tests
 *
 * Tests for the Phase 9.3 DAG-based dependency resolution scheduler.
 */

import { describe, it, expect } from 'vitest';
import { DAGScheduler, DAGSchedulerError } from '@/lib/scheduler/dag-scheduler';
import type { PlanStep } from '@/agents/base';

describe('DAGScheduler', () => {
  describe('buildExecutionLevels', () => {
    it('should handle empty steps array', () => {
      const levels = DAGScheduler.buildExecutionLevels([]);
      expect(levels).toEqual([]);
    });

    it('should place independent steps at level 0', () => {
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {} },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {} },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);

      expect(levels.length).toBe(1);
      expect(levels[0].level).toBe(0);
      expect(levels[0].tasks.length).toBe(3);
      expect(levels[0].tasks.every(t => t.status === 'ready')).toBe(true);
    });

    it('should create sequential levels for linear dependencies', () => {
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {}, dependencies: ['step2'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);

      expect(levels.length).toBe(3);
      expect(levels[0].tasks[0].step.id).toBe('step1');
      expect(levels[1].tasks[0].step.id).toBe('step2');
      expect(levels[2].tasks[0].step.id).toBe('step3');
    });

    it('should group parallel tasks at the same level', () => {
      const steps: PlanStep[] = [
        { id: 'root', action: 'Root', tool: 'tool1', payload: {} },
        { id: 'branch1', action: 'Branch 1', tool: 'tool2', payload: {}, dependencies: ['root'] },
        { id: 'branch2', action: 'Branch 2', tool: 'tool3', payload: {}, dependencies: ['root'] },
        { id: 'merge', action: 'Merge', tool: 'tool4', payload: {}, dependencies: ['branch1', 'branch2'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);

      expect(levels.length).toBe(3);
      expect(levels[0].tasks.length).toBe(1); // root
      expect(levels[1].tasks.length).toBe(2); // branch1, branch2
      expect(levels[2].tasks.length).toBe(1); // merge
    });

    it('should detect circular dependencies', () => {
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {}, dependencies: ['step3'] },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {}, dependencies: ['step2'] },
      ];

      expect(() => DAGScheduler.buildExecutionLevels(steps)).toThrow(DAGSchedulerError);
    });

    it('should compute critical path weights', () => {
      const steps: PlanStep[] = [
        { id: 'root', action: 'Root', tool: 'tool1', payload: {} },
        { id: 'branch1', action: 'Branch 1', tool: 'tool2', payload: {}, dependencies: ['root'] },
        { id: 'leaf', action: 'Leaf', tool: 'tool3', payload: {}, dependencies: ['branch1'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);
      const flatTasks = DAGScheduler.flattenTasks(levels);

      // Root should have highest critical path weight (3 = path length to deepest leaf)
      const rootTask = flatTasks.find(t => t.step.id === 'root');
      const leafTask = flatTasks.find(t => t.step.id === 'leaf');

      expect(rootTask!.criticalPathWeight).toBeGreaterThan(leafTask!.criticalPathWeight);
    });

    it('should skip non-existent dependencies gracefully', () => {
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {}, dependencies: ['non_existent'] },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
      ];

      // Should not throw, treats missing dep as satisfied
      const levels = DAGScheduler.buildExecutionLevels(steps);
      expect(levels.length).toBe(2);
    });

    it('should prioritise audit steps', () => {
      const steps: PlanStep[] = [
        { id: 'normal', action: 'Normal', tool: 'regular_tool', payload: {} },
        { id: 'audit', action: 'Audit', tool: 'audit:check', payload: {} },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);
      const tasks = levels[0].tasks;

      // Audit should come first (lower priority number)
      expect(tasks[0].step.id).toBe('audit');
    });
  });

  describe('flattenTasks', () => {
    it('should flatten all levels into single array', () => {
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
        { id: 'step3', action: 'Action 3', tool: 'tool3', payload: {}, dependencies: ['step2'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);
      const flat = DAGScheduler.flattenTasks(levels);

      expect(flat.length).toBe(3);
    });

    it('should preserve order from level 0 to max', () => {
      const steps: PlanStep[] = [
        { id: 'step1', action: 'Action 1', tool: 'tool1', payload: {} },
        { id: 'step2', action: 'Action 2', tool: 'tool2', payload: {}, dependencies: ['step1'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);
      const flat = DAGScheduler.flattenTasks(levels);

      expect(flat[0].level).toBe(0);
      expect(flat[1].level).toBe(1);
    });
  });

  describe('complex DAG scenarios', () => {
    it('should handle diamond dependency pattern', () => {
      // Diamond: A -> B, A -> C, B -> D, C -> D
      const steps: PlanStep[] = [
        { id: 'A', action: 'A', tool: 'tool', payload: {} },
        { id: 'B', action: 'B', tool: 'tool', payload: {}, dependencies: ['A'] },
        { id: 'C', action: 'C', tool: 'tool', payload: {}, dependencies: ['A'] },
        { id: 'D', action: 'D', tool: 'tool', payload: {}, dependencies: ['B', 'C'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);

      expect(levels.length).toBe(3);
      expect(levels[0].tasks[0].step.id).toBe('A');
      expect(levels[1].tasks.map(t => t.step.id).sort()).toEqual(['B', 'C']);
      expect(levels[2].tasks[0].step.id).toBe('D');
    });

    it('should handle wide parallel stage', () => {
      const steps: PlanStep[] = [
        { id: 'start', action: 'Start', tool: 'tool', payload: {} },
        { id: 'p1', action: 'P1', tool: 'tool', payload: {}, dependencies: ['start'] },
        { id: 'p2', action: 'P2', tool: 'tool', payload: {}, dependencies: ['start'] },
        { id: 'p3', action: 'P3', tool: 'tool', payload: {}, dependencies: ['start'] },
        { id: 'p4', action: 'P4', tool: 'tool', payload: {}, dependencies: ['start'] },
        { id: 'p5', action: 'P5', tool: 'tool', payload: {}, dependencies: ['start'] },
        { id: 'end', action: 'End', tool: 'tool', payload: {}, dependencies: ['p1', 'p2', 'p3', 'p4', 'p5'] },
      ];

      const levels = DAGScheduler.buildExecutionLevels(steps);

      expect(levels.length).toBe(3);
      expect(levels[1].tasks.length).toBe(5); // 5 parallel tasks
    });
  });
});
