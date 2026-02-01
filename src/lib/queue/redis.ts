/**
 * UNI-167: Redis Connection Singleton
 *
 * Provides a shared Redis connection for BullMQ queues and workers.
 * Supports Upstash Redis (TLS) and standard Redis connections.
 *
 * BullMQ requires `maxRetriesPerRequest: null` — this is configured here.
 */

import IORedis from 'ioredis';

let connection: IORedis | null = null;

/**
 * Get or create a singleton Redis connection.
 * Returns null if no Redis URL is configured (graceful degradation).
 */
export function getRedisConnection(): IORedis | null {
  if (connection) return connection;

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';

  if (!redisUrl) {
    console.warn(
      '[queue/redis] No REDIS_URL or UPSTASH_REDIS_URL configured. Queue system disabled.',
    );
    return null;
  }

  try {
    const useTls = redisUrl.startsWith('rediss://');

    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false, // Upstash compatibility
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    });

    connection.on('connect', () => {
      console.log('[queue/redis] Connected to Redis');
    });

    connection.on('error', (err) => {
      console.error('[queue/redis] Redis error:', err.message);
    });

    return connection;
  } catch (error: any) {
    console.error('[queue/redis] Failed to create Redis connection:', error.message);
    return null;
  }
}

/**
 * Check if Redis is available and configured.
 */
export function isRedisAvailable(): boolean {
  const conn = getRedisConnection();
  return conn !== null && conn.status === 'ready';
}

/**
 * Close the Redis connection (for graceful shutdown).
 */
export async function closeRedisConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
