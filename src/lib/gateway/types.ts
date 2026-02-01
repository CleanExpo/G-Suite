/**
 * Gateway Types
 *
 * Type definitions for API Gateway components: rate limiting, API keys, request/response handling.
 */

// ─── Rate Limiting ──────────────────────────────────────────────────────────

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds (e.g., 60000 = 1 minute)
  maxRequests: number; // Maximum requests allowed in window
  identifier: string; // Unique identifier (userId, IP, or API key hash)
  endpoint?: string; // Specific endpoint or "*" for global
}

export interface RateLimitResult {
  allowed: boolean; // Whether the request is allowed
  remaining: number; // Requests remaining in current window
  resetAt: Date; // When the rate limit resets
  limit: number; // Total limit for this tier
}

export type RateLimitTier = 'standard' | 'premium' | 'enterprise';

export interface RateLimitTierConfig {
  windowMs: number;
  maxRequests: number;
}

// ─── API Keys ───────────────────────────────────────────────────────────────

export interface ApiKeyValidation {
  valid: boolean;
  userId?: string;
  scopes?: string[];
  tier?: RateLimitTier;
  keyPrefix?: string;
}

export interface ApiKeyScope {
  resource: string; // e.g., "missions", "agents", "webhooks"
  action: string; // e.g., "read", "write", "execute"
}

// ─── Request/Response ───────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

// ─── CORS ───────────────────────────────────────────────────────────────────

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  credentials: boolean;
  maxAge?: number;
}
