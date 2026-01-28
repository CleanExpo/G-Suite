/**
 * UNI-174: Notification Manager
 */

import { prisma } from '@/lib/db';
import type {
  Notification,
  NotificationInput,
  NotificationFilter,
  PaginationOptions,
  PaginatedResult,
  NotificationStatus,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Create Notification
// ────────────────────────────────────────────────────────────────────────────

export async function createNotification(
  userId: string,
  input: NotificationInput
): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      channel: input.channel || null,
      subject: input.subject,
      body: input.body,
      templateId: input.templateId || null,
      triggerEvent: input.triggerEvent,
      referenceType: input.referenceType || null,
      referenceId: input.referenceId || null,
      status: 'pending',
      metadata: input.metadata ? (input.metadata as any) : null,
    },
  });

  return notification as Notification;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Notification by ID
// ────────────────────────────────────────────────────────────────────────────

export async function getNotificationById(
  userId: string,
  notificationId: string
): Promise<Notification | null> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  return notification as Notification | null;
}

// ────────────────────────────────────────────────────────────────────────────
// List Notifications
// ────────────────────────────────────────────────────────────────────────────

export async function listNotifications(
  userId: string,
  filter?: NotificationFilter,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Notification>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = pagination?.sortBy || 'createdAt';
  const sortOrder = pagination?.sortOrder || 'desc';

  // Build where clause
  const where: any = {
    userId,
  };

  if (filter?.type) {
    where.type = filter.type;
  }

  if (filter?.status) {
    where.status = filter.status;
  }

  if (filter?.triggerEvent) {
    where.triggerEvent = filter.triggerEvent;
  }

  if (filter?.referenceType) {
    where.referenceType = filter.referenceType;
  }

  if (filter?.referenceId) {
    where.referenceId = filter.referenceId;
  }

  if (filter?.fromDate || filter?.toDate) {
    where.createdAt = {};
    if (filter.fromDate) {
      where.createdAt.gte = filter.fromDate;
    }
    if (filter.toDate) {
      where.createdAt.lte = filter.toDate;
    }
  }

  // Execute query in parallel
  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.notification.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: notifications as Notification[],
    pagination: {
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Update Notification Status
// ────────────────────────────────────────────────────────────────────────────

export async function updateNotificationStatus(
  userId: string,
  notificationId: string,
  status: NotificationStatus,
  failureReason?: string
): Promise<Notification> {
  // Verify ownership
  const existing = await getNotificationById(userId, notificationId);
  if (!existing) {
    throw new Error('Notification not found');
  }

  const updateData: any = {
    status,
  };

  if (status === 'sent') {
    updateData.sentAt = new Date();
  } else if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  } else if (status === 'failed') {
    updateData.failureReason = failureReason || 'Unknown error';
    updateData.retryCount = existing.retryCount + 1;
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: updateData,
  });

  return notification as Notification;
}

// ────────────────────────────────────────────────────────────────────────────
// Mark Notification as Read (for in-app notifications)
// ────────────────────────────────────────────────────────────────────────────

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<Notification> {
  // Verify ownership
  const existing = await getNotificationById(userId, notificationId);
  if (!existing) {
    throw new Error('Notification not found');
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      readAt: new Date(),
    },
  });

  return notification as Notification;
}

// ────────────────────────────────────────────────────────────────────────────
// Mark All Notifications as Read
// ────────────────────────────────────────────────────────────────────────────

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      type: 'in_app',
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return result.count;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Unread Notification Count
// ────────────────────────────────────────────────────────────────────────────

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const count = await prisma.notification.count({
    where: {
      userId,
      type: 'in_app',
      readAt: null,
    },
  });

  return count;
}

// ────────────────────────────────────────────────────────────────────────────
// Retry Failed Notification
// ────────────────────────────────────────────────────────────────────────────

export async function retryFailedNotification(
  userId: string,
  notificationId: string
): Promise<Notification> {
  // Verify ownership
  const existing = await getNotificationById(userId, notificationId);
  if (!existing) {
    throw new Error('Notification not found');
  }

  if (existing.status !== 'failed') {
    throw new Error('Can only retry failed notifications');
  }

  if (existing.retryCount >= 3) {
    throw new Error('Maximum retry attempts reached');
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: 'pending',
      failureReason: null,
    },
  });

  return notification as Notification;
}

// ────────────────────────────────────────────────────────────────────────────
// Send Notification (Placeholder - actual implementation depends on provider)
// ────────────────────────────────────────────────────────────────────────────

export async function sendNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  const notification = await getNotificationById(userId, notificationId);
  if (!notification) {
    throw new Error('Notification not found');
  }

  try {
    // TODO: Implement actual notification sending logic
    // - Email: Use Resend, SendGrid, or similar
    // - SMS: Use Twilio
    // - Webhook: Make HTTP POST request
    // - In-app: Already in database, just mark as sent

    switch (notification.type) {
      case 'email':
        // await sendEmail(notification);
        console.log(`Sending email notification to ${notification.channel}`);
        break;
      case 'sms':
        // await sendSMS(notification);
        console.log(`Sending SMS notification to ${notification.channel}`);
        break;
      case 'webhook':
        // await sendWebhook(notification);
        console.log(`Sending webhook notification to ${notification.channel}`);
        break;
      case 'in_app':
        // Already in database
        console.log('In-app notification created');
        break;
    }

    // Mark as sent
    await updateNotificationStatus(userId, notificationId, 'sent');
  } catch (error: any) {
    // Mark as failed
    await updateNotificationStatus(userId, notificationId, 'failed', error.message);
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Get Notifications by Reference
// ────────────────────────────────────────────────────────────────────────────

export async function getNotificationsByReference(
  userId: string,
  referenceType: string,
  referenceId: string
): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      referenceType,
      referenceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return notifications as Notification[];
}
