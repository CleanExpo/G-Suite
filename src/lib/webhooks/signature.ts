/**
 * Webhook Signature
 *
 * HMAC-SHA256 signature generation and verification for webhook security.
 */

import crypto from 'crypto';

// ─── Secret Generation ──────────────────────────────────────────────────────

/**
 * Generate a new webhook secret.
 *
 * Format: `whsec_{64 hex chars}`
 *
 * @returns Webhook secret string
 */
export function generateWebhookSecret(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `whsec_${randomBytes}`;
}

// ─── Signature Generation ───────────────────────────────────────────────────

/**
 * Generate HMAC-SHA256 signature for webhook payload.
 *
 * Signature scheme: `HMAC-SHA256(timestamp.payload, secret)`
 *
 * @param payload - JSON payload to sign
 * @param secret - Webhook secret
 * @param timestamp - Unix timestamp (default: now)
 * @returns Signature string
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  timestamp?: number,
): string {
  const ts = timestamp || Date.now();
  const signedPayload = `${ts}.${payload}`;

  return crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
}

/**
 * Generate signature header value.
 *
 * Format: `t={timestamp},v1={signature}`
 *
 * @param payload - JSON payload
 * @param secret - Webhook secret
 * @returns Signature header value
 */
export function generateSignatureHeader(payload: string, secret: string): string {
  const timestamp = Date.now();
  const signature = generateWebhookSignature(payload, secret, timestamp);

  return `t=${timestamp},v1=${signature}`;
}

// ─── Signature Verification ─────────────────────────────────────────────────

/**
 * Parse signature header.
 *
 * @param header - Signature header value
 * @returns Parsed timestamp and signature
 */
export function parseSignatureHeader(header: string): {
  timestamp: number;
  signature: string;
} | null {
  const parts = header.split(',');
  let timestamp = 0;
  let signature = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = parseInt(value, 10);
    } else if (key === 'v1') {
      signature = value;
    }
  }

  if (timestamp === 0 || !signature) {
    return null;
  }

  return { timestamp, signature };
}

/**
 * Verify webhook signature.
 *
 * @param payload - Raw payload string
 * @param signatureHeader - Signature header value
 * @param secret - Webhook secret
 * @param toleranceMs - Maximum age of webhook in milliseconds (default: 5 minutes)
 * @returns Whether signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceMs: number = 300_000, // 5 minutes
): boolean {
  // Parse signature header
  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) {
    console.warn('[Webhook] Invalid signature header format');
    return false;
  }

  const { timestamp, signature } = parsed;

  // Check timestamp tolerance (prevent replay attacks)
  const now = Date.now();
  if (Math.abs(now - timestamp) > toleranceMs) {
    console.warn('[Webhook] Signature timestamp out of tolerance');
    return false;
  }

  // Compute expected signature
  const expectedSignature = generateWebhookSignature(payload, secret, timestamp);

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    console.error('[Webhook] Signature comparison error:', error);
    return false;
  }
}
