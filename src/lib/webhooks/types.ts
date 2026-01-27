/**
 * Webhook Types
 *
 * Type definitions for webhook events, payloads, and delivery status.
 */

// ─── Event Types ────────────────────────────────────────────────────────────

export type WebhookEventType =
  | 'mission.completed'
  | 'mission.failed'
  | 'mission.started'
  | 'agent.invoked'
  | 'wallet.topup'
  | 'webhook.test'
  | 'monitoring.alert.triggered' // UNI-168
  | 'monitoring.alert.resolved' // UNI-168
  | 'monitoring.health.degraded'; // UNI-168

export interface WebhookEvent {
  type: WebhookEventType;
  data: Record<string, unknown>;
  userId: string;
  timestamp?: Date;
}

// ─── Delivery Status ────────────────────────────────────────────────────────

export type WebhookDeliveryStatus = 'pending' | 'sent' | 'failed' | 'retrying';

export interface WebhookDeliveryAttempt {
  id: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  responseCode?: number;
  responseBody?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

// ─── Endpoint Configuration ─────────────────────────────────────────────────

export interface WebhookEndpointConfig {
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface WebhookEndpointInfo {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Dispatch Options ───────────────────────────────────────────────────────

export interface WebhookDispatchOptions {
  maxAttempts?: number;
  timeout?: number;
  retryDelay?: number;
}

// ─── Signature ──────────────────────────────────────────────────────────────

export interface WebhookSignatureHeader {
  timestamp: number;
  signature: string;
}
