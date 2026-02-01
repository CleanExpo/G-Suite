/**
 * UNI-167: Retry Strategy — Exponential Backoff with Jitter
 *
 * Pure functions for computing retry delays. No side effects.
 *
 * Strategies:
 * - Exponential: delay * 2^attempt, capped at maxDelay
 * - Fixed: constant delay regardless of attempt
 * - Jitter: random factor [0.5, 1.5] to prevent thundering herd
 */

import type { BackoffStrategy } from './types';

/** Default backoff strategy used when none is specified */
export const DEFAULT_BACKOFF: BackoffStrategy = {
  type: 'exponential',
  delay: 1_000, // 1 second base
  maxDelay: 60_000, // 1 minute cap
  jitter: true,
};

/**
 * Compute the delay in milliseconds before the next retry attempt.
 *
 * @param attempt - Zero-based attempt number (0 = first retry)
 * @param strategy - Backoff configuration
 * @returns Delay in milliseconds
 *
 * @example
 * computeBackoffDelay(0, DEFAULT_BACKOFF) // ~1000ms (with jitter)
 * computeBackoffDelay(1, DEFAULT_BACKOFF) // ~2000ms (with jitter)
 * computeBackoffDelay(5, DEFAULT_BACKOFF) // ~32000ms (with jitter)
 * computeBackoffDelay(10, DEFAULT_BACKOFF) // 60000ms (capped)
 */
export function computeBackoffDelay(
  attempt: number,
  strategy: BackoffStrategy = DEFAULT_BACKOFF,
): number {
  const { type, delay, maxDelay = 60_000, jitter = true } = strategy;

  let computed: number;

  if (type === 'fixed') {
    computed = delay;
  } else {
    // Exponential: delay * 2^attempt
    computed = delay * Math.pow(2, attempt);
  }

  // Cap at maxDelay
  computed = Math.min(computed, maxDelay);

  // Apply jitter: multiply by random factor in [0.5, 1.5]
  if (jitter) {
    const jitterFactor = 0.5 + Math.random();
    computed = Math.round(computed * jitterFactor);
  }

  return computed;
}

/**
 * Check if a job should be retried based on attempt count and max attempts.
 *
 * @param attempts - Current number of attempts made (1-based)
 * @param maxAttempts - Maximum allowed attempts
 * @returns true if the job should be retried
 */
export function shouldRetry(attempts: number, maxAttempts: number): boolean {
  return attempts < maxAttempts;
}
