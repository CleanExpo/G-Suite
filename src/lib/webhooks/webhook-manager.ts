/**
 * Webhook Manager
 *
 * CRUD operations for webhook endpoints and delivery management.
 */

import prisma from '@/prisma';
import {encrypt} from '@/lib/encryption';
import {generateWebhookSecret} from './signature';
import type {WebhookEndpointConfig, WebhookEndpointInfo} from './types';

// ─── Endpoint CRUD ──────────────────────────────────────────────────────────

/**
 * Create a new webhook endpoint.
 *
 * @param userId - User ID
 * @param config - Webhook configuration
 * @returns Created webhook endpoint with plaintext secret (shown once)
 */
export async function createWebhookEndpoint(
  userId: string,
  config: WebhookEndpointConfig
): Promise<{endpoint: WebhookEndpointInfo; secret: string}> {
  // Generate secret if not provided
  const secret = config.secret || generateWebhookSecret();

  // Encrypt secret for storage
  const encryptedSecret = encrypt(secret);

  // Create endpoint
  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      url: config.url,
      secret: encryptedSecret,
      events: config.events,
      isActive: config.isActive !== false,
      userId,
      metadata: config.metadata as any,
    },
  });

  return {
    endpoint: {
      id: endpoint.id,
      url: endpoint.url,
      events: endpoint.events,
      isActive: endpoint.isActive,
      userId: endpoint.userId,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    },
    secret, // Return plaintext secret once
  };
}

/**
 * List webhook endpoints for a user.
 *
 * @param userId - User ID
 * @returns List of webhook endpoints
 */
export async function listWebhookEndpoints(
  userId: string
): Promise<WebhookEndpointInfo[]> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {userId},
    orderBy: {createdAt: 'desc'},
  });

  return endpoints.map(endpoint => ({
    id: endpoint.id,
    url: endpoint.url,
    events: endpoint.events,
    isActive: endpoint.isActive,
    userId: endpoint.userId,
    createdAt: endpoint.createdAt,
    updatedAt: endpoint.updatedAt,
  }));
}

/**
 * Get webhook endpoint by ID.
 *
 * @param endpointId - Endpoint ID
 * @param userId - User ID (for ownership check)
 * @returns Webhook endpoint or null
 */
export async function getWebhookEndpoint(
  endpointId: string,
  userId: string
): Promise<WebhookEndpointInfo | null> {
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: {
      id: endpointId,
      userId,
    },
  });

  if (!endpoint) {
    return null;
  }

  return {
    id: endpoint.id,
    url: endpoint.url,
    events: endpoint.events,
    isActive: endpoint.isActive,
    userId: endpoint.userId,
    createdAt: endpoint.createdAt,
    updatedAt: endpoint.updatedAt,
  };
}

/**
 * Update webhook endpoint.
 *
 * @param endpointId - Endpoint ID
 * @param userId - User ID (for ownership check)
 * @param updates - Fields to update
 * @returns Updated endpoint or null
 */
export async function updateWebhookEndpoint(
  endpointId: string,
  userId: string,
  updates: {
    url?: string;
    events?: string[];
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }
): Promise<WebhookEndpointInfo | null> {
  // Verify ownership
  const existing = await prisma.webhookEndpoint.findFirst({
    where: {id: endpointId, userId},
  });

  if (!existing) {
    return null;
  }

  // Update endpoint
  const updated = await prisma.webhookEndpoint.update({
    where: {id: endpointId},
    data: {
      ...(updates.url && {url: updates.url}),
      ...(updates.events && {events: updates.events}),
      ...(updates.isActive !== undefined && {isActive: updates.isActive}),
      ...(updates.metadata && {metadata: updates.metadata as any}),
    },
  });

  return {
    id: updated.id,
    url: updated.url,
    events: updated.events,
    isActive: updated.isActive,
    userId: updated.userId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Delete webhook endpoint.
 *
 * @param endpointId - Endpoint ID
 * @param userId - User ID (for ownership check)
 * @returns Whether deletion was successful
 */
export async function deleteWebhookEndpoint(
  endpointId: string,
  userId: string
): Promise<boolean> {
  // Verify ownership
  const existing = await prisma.webhookEndpoint.findFirst({
    where: {id: endpointId, userId},
  });

  if (!existing) {
    return false;
  }

  // Delete endpoint and associated deliveries (cascade)
  await prisma.webhookEndpoint.delete({
    where: {id: endpointId},
  });

  return true;
}

// ─── Delivery Management ────────────────────────────────────────────────────

/**
 * List webhook deliveries for an endpoint.
 *
 * @param endpointId - Endpoint ID
 * @param userId - User ID (for ownership check)
 * @param limit - Maximum number of deliveries to return
 * @returns List of deliveries
 */
export async function listWebhookDeliveries(
  endpointId: string,
  userId: string,
  limit: number = 50
) {
  // Verify endpoint ownership
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: {id: endpointId, userId},
  });

  if (!endpoint) {
    return [];
  }

  return await prisma.webhookDelivery.findMany({
    where: {endpointId},
    orderBy: {createdAt: 'desc'},
    take: limit,
  });
}
