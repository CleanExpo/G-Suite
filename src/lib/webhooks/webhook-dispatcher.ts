/**
 * Webhook Dispatcher
 *
 * Dispatches webhook events to registered endpoints with retry logic.
 * Uses BullMQ for async delivery with exponential backoff.
 */

import prisma from '@/prisma';
import {taskQueue} from '@/lib/queue';
import {decrypt} from '@/lib/encryption';
import {generateSignatureHeader} from './signature';
import type {WebhookEvent, WebhookDispatchOptions} from './types';

// ─── Event Dispatcher ───────────────────────────────────────────────────────

/**
 * Dispatch webhook event to all subscribed endpoints.
 *
 * Creates delivery records and queues delivery jobs for async processing.
 *
 * @param event - Webhook event to dispatch
 * @param options - Dispatch options (maxAttempts, timeout, etc.)
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  options?: WebhookDispatchOptions
): Promise<void> {
  const {type, data, userId} = event;

  try {
    // Find all active endpoints subscribed to this event type
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        userId,
        isActive: true,
        events: {has: type},
      },
    });

    if (endpoints.length === 0) {
      console.log(`[Webhook] No endpoints subscribed to ${type}`);
      return;
    }

    // Create delivery records and queue jobs
    for (const endpoint of endpoints) {
      // Create delivery record
      const delivery = await prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          eventType: type,
          payload: data as any,
          status: 'pending',
          maxAttempts: options?.maxAttempts || 3,
        },
      });

      // Queue delivery job (async with retry)
      await taskQueue.addJob(
        'webhooks',
        'send-webhook',
        {
          deliveryId: delivery.id,
          endpointId: endpoint.id,
          url: endpoint.url,
          secret: decrypt(endpoint.secret),
          payload: data,
          eventType: type,
        },
        {
          userId,
          priority: 5,
          attempts: options?.maxAttempts || 3,
        }
      );

      console.log(
        `[Webhook] Queued delivery ${delivery.id} for ${type} to ${endpoint.url}`
      );
    }
  } catch (error) {
    console.error('[Webhook] Error dispatching webhook:', error);
  }
}

// ─── Delivery Processor ─────────────────────────────────────────────────────

/**
 * Process a webhook delivery job (called by BullMQ worker).
 *
 * Sends HTTP POST request to endpoint with HMAC signature.
 *
 * @param job - BullMQ job with delivery data
 * @returns Delivery result
 */
export async function processWebhookDelivery(job: any): Promise<any> {
  const {deliveryId, url, secret, payload, eventType} = job.data;

  console.log(`[Webhook] Processing delivery ${deliveryId} to ${url}`);

  try {
    // Update delivery status to 'retrying'
    await prisma.webhookDelivery.update({
      where: {id: deliveryId},
      data: {
        status: 'retrying',
        attempts: {increment: 1},
      },
    });

    // Prepare payload
    const payloadString = JSON.stringify({
      type: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    // Generate signature
    const signatureHeader = generateSignatureHeader(payloadString, secret);

    // Send HTTP POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'G-Pilot-Webhooks/1.0',
        'X-Webhook-Signature': signatureHeader,
      },
      body: payloadString,
      signal: AbortSignal.timeout(10_000), // 10 second timeout
    });

    const responseBody = await response.text();

    // Update delivery status to 'sent'
    await prisma.webhookDelivery.update({
      where: {id: deliveryId},
      data: {
        status: 'sent',
        responseCode: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit to 1000 chars
        sentAt: new Date(),
      },
    });

    console.log(
      `[Webhook] Delivery ${deliveryId} sent successfully (${response.status})`
    );

    return {success: true, status: response.status};
  } catch (error: any) {
    console.error(`[Webhook] Delivery ${deliveryId} failed:`, error);

    // Update delivery status to 'failed'
    await prisma.webhookDelivery.update({
      where: {id: deliveryId},
      data: {
        status: 'failed',
        error: error.message,
      },
    });

    throw error; // Re-throw to trigger BullMQ retry
  }
}
