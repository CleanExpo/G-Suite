/**
 * UNI-171: Interaction Manager
 *
 * CRUD operations for CRM interactions (calls, emails, meetings, notes)
 */

import prisma from '@/prisma';
import type { InteractionInput, InteractionFilter, InteractionUpdate, PaginatedResponse } from './types';
import type { Interaction } from '@prisma/client';

/**
 * Create a new interaction
 */
export async function createInteraction(
  userId: string,
  data: InteractionInput
): Promise<Interaction> {
  return prisma.interaction.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
    },
    include: {
      contact: true,
    },
  });
}

/**
 * List interactions with filtering and pagination
 */
export async function listInteractions(
  userId: string,
  filters: InteractionFilter = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Interaction>> {
  const skip = (page - 1) * limit;

  const where: any = { userId, deletedAt: null };

  // Apply filters
  if (filters.type) where.type = filters.type;
  if (filters.contactId) where.contactId = filters.contactId;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.dealId) where.dealId = filters.dealId;
  if (filters.status) where.status = filters.status;

  // Date range filtering
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const [items, total] = await Promise.all([
    prisma.interaction.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.interaction.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get interaction by ID
 */
export async function getInteractionById(
  userId: string,
  id: string
): Promise<Interaction | null> {
  return prisma.interaction.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      contact: true,
    },
  });
}

/**
 * Update interaction
 */
export async function updateInteraction(
  userId: string,
  id: string,
  data: InteractionUpdate
): Promise<Interaction | null> {
  // Verify ownership
  const existing = await prisma.interaction.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.interaction.update({
    where: { id },
    data,
    include: {
      contact: true,
    },
  });
}

/**
 * Delete interaction (soft delete)
 */
export async function deleteInteraction(
  userId: string,
  id: string
): Promise<Interaction | null> {
  // Verify ownership
  const existing = await prisma.interaction.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.interaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get activity timeline for a contact
 */
export async function getContactTimeline(
  userId: string,
  contactId: string,
  limit = 50
): Promise<Interaction[]> {
  return prisma.interaction.findMany({
    where: {
      userId,
      contactId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get activity timeline for a company
 */
export async function getCompanyTimeline(
  userId: string,
  companyId: string,
  limit = 50
): Promise<Interaction[]> {
  return prisma.interaction.findMany({
    where: {
      userId,
      companyId,
      deletedAt: null,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get activity timeline for a deal
 */
export async function getDealTimeline(
  userId: string,
  dealId: string,
  limit = 50
): Promise<Interaction[]> {
  return prisma.interaction.findMany({
    where: {
      userId,
      dealId,
      deletedAt: null,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get upcoming scheduled interactions
 */
export async function getUpcomingInteractions(
  userId: string,
  limit = 20
): Promise<Interaction[]> {
  return prisma.interaction.findMany({
    where: {
      userId,
      status: 'scheduled',
      scheduledAt: { gte: new Date() },
      deletedAt: null,
    },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
    take: limit,
  });
}
