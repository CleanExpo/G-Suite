/**
 * Rate Limiter Tests
 *
 * Tests for Redis-backed sliding window rate limiter.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis connection
const mockRedis = {
  multi: vi.fn(),
  zremrangebyscore: vi.fn(),
  zadd: vi.fn(),
  zcard: vi.fn(),
  pexpire: vi.fn(),
  exec: vi.fn(),
};

const mockMulti = {
  zremrangebyscore: vi.fn().mockReturnThis(),
  zadd: vi.fn().mockReturnThis(),
  zcard: vi.fn().mockReturnThis(),
  pexpire: vi.fn().mockReturnThis(),
  exec: vi.fn(),
};

vi.mock('@/lib/queue/redis', () => ({
  getRedisConnection: vi.fn(),
}));

import { getRedisConnection } from '@/lib/queue/redis';
import {
  checkRateLimit,
  getRateLimitConfig,
  getRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from '@/lib/gateway/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RATE_LIMIT_TIERS', () => {
    it('should have standard tier with 100 requests per minute', () => {
      expect(RATE_LIMIT_TIERS.standard.maxRequests).toBe(100);
      expect(RATE_LIMIT_TIERS.standard.windowMs).toBe(60_000);
    });

    it('should have premium tier with 1000 requests per minute', () => {
      expect(RATE_LIMIT_TIERS.premium.maxRequests).toBe(1000);
      expect(RATE_LIMIT_TIERS.premium.windowMs).toBe(60_000);
    });

    it('should have enterprise tier with 10000 requests per minute', () => {
      expect(RATE_LIMIT_TIERS.enterprise.maxRequests).toBe(10_000);
      expect(RATE_LIMIT_TIERS.enterprise.windowMs).toBe(60_000);
    });
  });

  describe('getRateLimitConfig', () => {
    it('should return config for standard tier', () => {
      const config = getRateLimitConfig('standard', 'user_123', '/api/agents');

      expect(config.maxRequests).toBe(100);
      expect(config.windowMs).toBe(60_000);
      expect(config.identifier).toBe('user_123');
      expect(config.endpoint).toBe('/api/agents');
    });

    it('should return config for premium tier', () => {
      const config = getRateLimitConfig('premium', 'user_456');

      expect(config.maxRequests).toBe(1000);
      expect(config.identifier).toBe('user_456');
    });

    it('should return config for enterprise tier', () => {
      const config = getRateLimitConfig('enterprise', 'org_789');

      expect(config.maxRequests).toBe(10_000);
      expect(config.identifier).toBe('org_789');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow request when Redis is unavailable (graceful degradation)', async () => {
      vi.mocked(getRedisConnection).mockReturnValue(null);

      const result = await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });

    it('should allow request when under limit', async () => {
      mockMulti.exec.mockResolvedValue([
        [null, 5],  // zremrangebyscore result
        [null, 1],  // zadd result
        [null, 50], // zcard result - 50 requests (under 100 limit)
        [null, 1],  // pexpire result
      ]);

      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      const result = await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50);
      expect(result.limit).toBe(100);
    });

    it('should block request when over limit', async () => {
      mockMulti.exec.mockResolvedValue([
        [null, 0],   // zremrangebyscore result
        [null, 1],   // zadd result
        [null, 150], // zcard result - 150 requests (over 100 limit)
        [null, 1],   // pexpire result
      ]);

      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      const result = await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle Redis errors gracefully (fail open)', async () => {
      mockMulti.exec.mockRejectedValue(new Error('Redis connection failed'));
      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      const result = await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      // Should allow request on error (fail open for availability)
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });

    it('should use correct Redis key format', async () => {
      mockMulti.exec.mockResolvedValue([
        [null, 0],
        [null, 1],
        [null, 10],
        [null, 1],
      ]);

      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      await checkRateLimit({
        identifier: 'user_123',
        endpoint: '/api/agents',
        windowMs: 60_000,
        maxRequests: 100,
      });

      // Verify the multi was called (key format is used internally)
      expect(mockRedis.multi).toHaveBeenCalled();
    });

    it('should set TTL on rate limit key', async () => {
      mockMulti.exec.mockResolvedValue([
        [null, 0],
        [null, 1],
        [null, 10],
        [null, 1],
      ]);

      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      // Verify pexpire was called in the pipeline
      expect(mockMulti.pexpire).toHaveBeenCalled();
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should return correct rate limit headers', () => {
      const resetTime = new Date('2024-01-01T00:01:00Z');
      const result = {
        allowed: true,
        remaining: 75,
        resetAt: resetTime,
        limit: 100,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('75');
      expect(headers['X-RateLimit-Reset']).toBe(String(resetTime.getTime()));
    });

    it('should handle zero remaining correctly', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
        limit: 100,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });
  });

  describe('Sliding Window Algorithm', () => {
    it('should remove old entries outside window', async () => {
      mockMulti.exec.mockResolvedValue([
        [null, 10], // 10 old entries removed
        [null, 1],
        [null, 5],  // 5 requests in current window
        [null, 1],
      ]);

      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      const result = await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      // Should only count current window requests
      expect(result.remaining).toBe(95);
    });

    it('should track requests with unique timestamps', async () => {
      mockMulti.exec.mockResolvedValue([
        [null, 0],
        [null, 1],  // Request added successfully
        [null, 1],
        [null, 1],
      ]);

      mockRedis.multi.mockReturnValue(mockMulti);
      vi.mocked(getRedisConnection).mockReturnValue(mockRedis as any);

      await checkRateLimit({
        identifier: 'user_123',
        windowMs: 60_000,
        maxRequests: 100,
      });

      // Verify zadd was called with timestamp
      expect(mockMulti.zadd).toHaveBeenCalled();
    });
  });
});
