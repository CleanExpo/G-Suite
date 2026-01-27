/**
 * Rate Limiter
 *
 * Redis-backed sliding window rate limiter for API gateway.
 * Uses Redis sorted sets to track request timestamps within a time window.
 */

import {getRedisConnection} from '@/lib/queue/redis';
import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimitTier,
  RateLimitTierConfig,
} from './types';

// ─── Rate Limit Tiers ───────────────────────────────────────────────────────

export const RATE_LIMIT_TIERS: Record<RateLimitTier, RateLimitTierConfig> = {
  standard: {
    windowMs: 60_000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  premium: {
    windowMs: 60_000,
    maxRequests: 1000, // 1000 requests per minute
  },
  enterprise: {
    windowMs: 60_000,
    maxRequests: 10_000, // 10,000 requests per minute
  },
};

// ─── Rate Limit Checker ─────────────────────────────────────────────────────

/**
 * Check if a request is within rate limits using Redis sliding window.
 *
 * Algorithm:
 * 1. Remove all entries outside the current time window (ZREMRANGEBYSCORE)
 * 2. Add current request timestamp to sorted set (ZADD)
 * 3. Count total requests in window (ZCARD)
 * 4. Set expiry on key to prevent memory leaks (PEXPIRE)
 *
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisConnection();

  // Graceful degradation: if Redis is unavailable, allow request
  if (!redis) {
    console.warn('[RateLimit] Redis unavailable, allowing request');
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: new Date(Date.now() + config.windowMs),
      limit: config.maxRequests,
    };
  }

  const key = `ratelimit:${config.identifier}:${config.endpoint || '*'}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Use Redis pipeline for atomic operations
    const multi = redis.multi();

    // 1. Remove old entries outside window
    multi.zremrangebyscore(key, 0, windowStart);

    // 2. Add current request timestamp
    multi.zadd(key, now, `${now}-${Math.random()}`); // Random suffix for uniqueness

    // 3. Count requests in window
    multi.zcard(key);

    // 4. Set TTL to prevent memory leaks
    multi.pexpire(key, config.windowMs);

    const results = (await multi.exec()) || [];

    // Extract count from ZCARD result
    const count = (results[2]?.[1] as number) || 0;

    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);
    const resetAt = new Date(now + config.windowMs);

    return {
      allowed,
      remaining,
      resetAt,
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);

    // On error, allow request (fail open for availability)
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: new Date(Date.now() + config.windowMs),
      limit: config.maxRequests,
    };
  }
}

/**
 * Get rate limit configuration for a tier.
 */
export function getRateLimitConfig(
  tier: RateLimitTier,
  identifier: string,
  endpoint?: string
): RateLimitConfig {
  const tierConfig = RATE_LIMIT_TIERS[tier];
  return {
    ...tierConfig,
    identifier,
    endpoint,
  };
}

/**
 * Get rate limit headers for HTTP response.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<
  string,
  string
> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt.getTime()),
  };
}
