/**
 * UNI-383: Redis Job Queue System Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis connection
vi.mock('@/lib/queue/redis', () => ({
  getRedisConnection: vi.fn(() => null), // No Redis in tests
  isRedisAvailable: vi.fn(() => false),
  closeRedisConnection: vi.fn(),
}));

describe('Task Queue System', () => {
  describe('Graceful Degradation', () => {
    it('should handle missing Redis gracefully', async () => {
      const { taskQueue } = await import('@/lib/queue/task-queue');

      const result = await taskQueue.addJob('test-queue', 'test-job', { foo: 'bar' }, {
        userId: 'test-user',
      });

      // Should return success false with appropriate message when Redis unavailable
      expect(result.success).toBe(false);
      expect(result.error).toContain('Queue system unavailable');
    });
  });

  describe('Retry Strategy', () => {
    it('should compute exponential backoff correctly', async () => {
      const { computeBackoffDelay } = await import('@/lib/queue/retry-strategy');

      // Use fixed strategy without jitter for deterministic testing
      const noJitterStrategy = { type: 'exponential' as const, delay: 1000, maxDelay: 60000, jitter: false };

      const delay0 = computeBackoffDelay(0, noJitterStrategy); // 1000
      const delay1 = computeBackoffDelay(1, noJitterStrategy); // 2000
      const delay2 = computeBackoffDelay(2, noJitterStrategy); // 4000

      // Each delay should be double the previous (exponential without jitter)
      expect(delay0).toBe(1000);
      expect(delay1).toBe(2000);
      expect(delay2).toBe(4000);
    });

    it('should determine retry eligibility correctly', async () => {
      const { shouldRetry } = await import('@/lib/queue/retry-strategy');

      expect(shouldRetry(1, 3)).toBe(true);  // 1st attempt, 3 max
      expect(shouldRetry(2, 3)).toBe(true);  // 2nd attempt, 3 max
      expect(shouldRetry(3, 3)).toBe(false); // 3rd attempt = max, no retry
      expect(shouldRetry(4, 3)).toBe(false); // Over max
    });
  });

  describe('Queue Types', () => {
    it('should export all required types', async () => {
      const types = await import('@/lib/queue/types');

      expect(types).toBeDefined();
      // Type checking is done at compile time, this just ensures exports work
    });
  });

  describe('Barrel Exports', () => {
    it('should export all queue components', async () => {
      const queue = await import('@/lib/queue');

      expect(queue.taskQueue).toBeDefined();
      expect(queue.jobProcessor).toBeDefined();
      expect(queue.deadLetterQueue).toBeDefined();
      expect(queue.cronScheduler).toBeDefined();
      expect(queue.getRedisConnection).toBeDefined();
      expect(queue.computeBackoffDelay).toBeDefined();
      expect(queue.shouldRetry).toBeDefined();
    });
  });
});
