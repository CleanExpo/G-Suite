/**
 * API Key Authentication
 *
 * Handles API key generation, validation, and scope checking.
 * API keys are stored as SHA-256 hashes in the database (never plaintext).
 */

import crypto from 'crypto';
import prisma from '@/prisma';
import type {ApiKeyValidation, RateLimitTier} from './types';

// ─── API Key Generation ─────────────────────────────────────────────────────

export interface ApiKeyPair {
  key: string; // Full plaintext key (show once)
  hash: string; // SHA-256 hash (store in DB)
  prefix: string; // First 15 chars for display
}

/**
 * Generate a new API key with SHA-256 hash.
 *
 * Format: `gp_live_{64 hex chars}`
 * Prefix: `gp_live_{8 hex chars}` (for display/identification)
 *
 * @returns API key pair with plaintext key, hash, and prefix
 */
export function generateApiKey(): ApiKeyPair {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `gp_live_${randomBytes}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 15); // "gp_live_abc1234"

  return {key, hash, prefix};
}

// ─── API Key Validation ─────────────────────────────────────────────────────

/**
 * Validate an API key and return associated metadata.
 *
 * @param key - Plaintext API key from request header
 * @returns Validation result with userId, scopes, and tier
 */
export async function validateApiKey(
  key: string
): Promise<ApiKeyValidation> {
  if (!key || !key.startsWith('gp_live_')) {
    return {valid: false};
  }

  // Hash the provided key
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  try {
    // Lookup key in database
    const apiKey = await prisma.apiKey.findUnique({
      where: {keyHash: hash},
      select: {
        userId: true,
        scopes: true,
        rateLimitTier: true,
        keyPrefix: true,
        isActive: true,
        expiresAt: true,
      },
    });

    // Check if key exists and is active
    if (!apiKey || !apiKey.isActive) {
      return {valid: false};
    }

    // Check if key has expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return {valid: false};
    }

    // Update lastUsedAt timestamp asynchronously (don't block)
    prisma.apiKey
      .update({
        where: {keyHash: hash},
        data: {lastUsedAt: new Date()},
      })
      .catch(err =>
        console.error('[ApiKey] Failed to update lastUsedAt:', err)
      );

    return {
      valid: true,
      userId: apiKey.userId,
      scopes: apiKey.scopes,
      tier: apiKey.rateLimitTier as RateLimitTier,
      keyPrefix: apiKey.keyPrefix,
    };
  } catch (error) {
    console.error('[ApiKey] Error validating API key:', error);
    return {valid: false};
  }
}

// ─── Scope Checking ─────────────────────────────────────────────────────────

/**
 * Check if a user's scopes include the required scope.
 *
 * Supports wildcards:
 * - `*` matches everything
 * - `missions:*` matches `missions:read`, `missions:write`, `missions:execute`
 * - `missions:read` matches exactly `missions:read`
 *
 * @param requiredScope - Scope required for the operation (e.g., "missions:read")
 * @param userScopes - User's granted scopes from API key
 * @returns Whether the user has the required scope
 */
export function checkScope(
  requiredScope: string,
  userScopes: string[]
): boolean {
  return userScopes.some(scope => {
    // Wildcard: full access
    if (scope === '*') return true;

    // Resource wildcard: missions:* matches missions:read, missions:write, etc.
    if (scope.endsWith(':*')) {
      const prefix = scope.slice(0, -1); // "missions:"
      return requiredScope.startsWith(prefix);
    }

    // Exact match
    return scope === requiredScope;
  });
}

/**
 * Parse a scope string into resource and action.
 *
 * @param scope - Scope string (e.g., "missions:read")
 * @returns Parsed scope with resource and action
 */
export function parseScope(scope: string): {
  resource: string;
  action: string;
} {
  const [resource, action] = scope.split(':');
  return {resource: resource || '', action: action || ''};
}

/**
 * Common scopes for G-Pilot API.
 */
export const COMMON_SCOPES = {
  MISSIONS_READ: 'missions:read',
  MISSIONS_WRITE: 'missions:write',
  MISSIONS_EXECUTE: 'missions:execute',
  AGENTS_READ: 'agents:read',
  AGENTS_EXECUTE: 'agents:execute',
  WEBHOOKS_READ: 'webhooks:read',
  WEBHOOKS_MANAGE: 'webhooks:manage',
  JOBS_READ: 'jobs:read',
  JOBS_WRITE: 'jobs:write',
  KEYS_MANAGE: 'keys:manage',
  ALL: '*',
};
