/**
 * Beads Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock BeadsLite
vi.mock('@/lib/beads-lite', () => ({
  BeadsLite: class {
    create = vi.fn().mockResolvedValue({ id: 'bd-test123' });
    update = vi.fn().mockResolvedValue({ id: 'bd-test123' });
    get = vi.fn().mockResolvedValue({ id: 'bd-test123', status: 'pending' });
  },
  TaskPriority: { HIGH: 0, MEDIUM: 1, LOW: 2 }
}));

import { BeadsMissionTracker, BeadsMissionContext } from '@/agents/beads-integration';
import { BeadsLite } from '@/lib/beads-lite';

describe('BeadsMissionTracker', () => {
  let tracker: BeadsMissionTracker;
  let mockBeads: BeadsLite;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBeads = new BeadsLite();
    tracker = new BeadsMissionTracker(mockBeads);
  });

  describe('Initialization', () => {
    it('should create tracker with BeadsLite instance', () => {
      expect(tracker).toBeDefined();
    });
  });

  describe('trackMission', () => {
    it('should create Beads task from mission context', async () => {
      const context: BeadsMissionContext = {
        mission: 'Implement new feature',
        userId: 'user_123'
      };

      const taskId = await tracker.trackMission(context);

      expect(taskId).toBe('bd-test123');
      expect(mockBeads.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Implement'),
          description: context.mission
        })
      );
    });

    it('should skip tracking when beadsAutoTrack is false', async () => {
      const context: BeadsMissionContext = {
        mission: 'Skip this mission',
        userId: 'user_123',
        beadsAutoTrack: false
      };

      const taskId = await tracker.trackMission(context);

      expect(taskId).toBe('');
      expect(mockBeads.create).not.toHaveBeenCalled();
    });

    it('should infer priority from context', async () => {
      const context: BeadsMissionContext = {
        mission: 'Critical bug fix needed urgently',
        userId: 'user_123'
      };

      await tracker.trackMission(context);

      expect(mockBeads.create).toHaveBeenCalled();
    });

    it('should truncate long mission titles', async () => {
      const longMission = 'A'.repeat(200);
      const context: BeadsMissionContext = {
        mission: longMission,
        userId: 'user_123'
      };

      await tracker.trackMission(context);

      expect(mockBeads.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/^A{1,80}/)
        })
      );
    });
  });

  describe('trackPlan', () => {
    it('should create tasks for plan steps', async () => {
      const steps = [
        { id: 'step1', action: 'Analyse requirements', tool: 'analysis', payload: {} },
        { id: 'step2', action: 'Implement solution', tool: 'code', payload: {} }
      ];

      const mapping = await tracker.trackPlan('mission-1', 'bd-parent', steps);

      expect(mapping.missionId).toBe('mission-1');
      expect(mapping.planSteps.length).toBe(2);
    });
  });
});
