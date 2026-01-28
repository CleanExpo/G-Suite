/**
 * UNI-171: Deal Manager
 *
 * CRUD operations for CRM deals (pipeline management)
 */

import prisma from '@/prisma';
import type { DealInput, DealFilter, DealUpdate, PaginatedResponse } from './types';
import type { Deal } from '@prisma/client';

/**
 * Deal stages in order
 */
export const DEAL_STAGES = [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
] as const;

/**
 * Create a new deal
 */
export async function createDeal(
  userId: string,
  data: DealInput
): Promise<Deal> {
  return prisma.deal.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      company: true,
      contacts: {
        where: { deletedAt: null },
      },
    },
  });
}

/**
 * List deals with filtering and pagination
 */
export async function listDeals(
  userId: string,
  filters: DealFilter = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Deal>> {
  const skip = (page - 1) * limit;

  const where: any = { userId, deletedAt: null };

  // Apply filters
  if (filters.stage) where.stage = filters.stage;
  if (filters.ownerId) where.ownerId = filters.ownerId;
  if (filters.companyId) where.companyId = filters.companyId;

  // Value range filtering
  if (filters.minValue !== undefined) {
    where.value = { ...where.value, gte: filters.minValue };
  }
  if (filters.maxValue !== undefined) {
    where.value = { ...where.value, lte: filters.maxValue };
  }

  // Search across multiple fields
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        company: true,
        contacts: {
          where: { deletedAt: null },
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
    prisma.deal.count({ where }),
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
 * Get deal by ID
 */
export async function getDealById(
  userId: string,
  id: string
): Promise<Deal | null> {
  return prisma.deal.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      company: true,
      contacts: {
        where: { deletedAt: null },
      },
    },
  });
}

/**
 * Update deal
 */
export async function updateDeal(
  userId: string,
  id: string,
  data: DealUpdate
): Promise<Deal | null> {
  // Verify ownership
  const existing = await prisma.deal.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.deal.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    },
    include: {
      company: true,
      contacts: {
        where: { deletedAt: null },
      },
    },
  });
}

/**
 * Move deal to next stage
 */
export async function moveDealToStage(
  userId: string,
  id: string,
  newStage: string
): Promise<Deal | null> {
  const existing = await prisma.deal.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  // Set actualCloseDate if moving to closed_won or closed_lost
  const updateData: any = {
    stage: newStage,
    updatedBy: userId,
    updatedAt: new Date(),
  };

  if (newStage === 'closed_won' || newStage === 'closed_lost') {
    updateData.actualCloseDate = new Date();
  }

  return prisma.deal.update({
    where: { id },
    data: updateData,
    include: {
      company: true,
      contacts: {
        where: { deletedAt: null },
      },
    },
  });
}

/**
 * Delete deal (soft delete)
 */
export async function deleteDeal(
  userId: string,
  id: string
): Promise<Deal | null> {
  // Verify ownership
  const existing = await prisma.deal.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.deal.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get pipeline view (deals grouped by stage)
 */
export async function getPipelineView(userId: string): Promise<any> {
  const deals = await prisma.deal.findMany({
    where: {
      userId,
      deletedAt: null,
      stage: { notIn: ['closed_won', 'closed_lost'] },
    },
    include: {
      company: true,
      contacts: {
        where: { deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by stage
  const pipeline: Record<string, Deal[]> = {};
  for (const stage of DEAL_STAGES.slice(0, -2)) {
    pipeline[stage] = deals.filter(d => d.stage === stage);
  }

  // Calculate totals
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const totalDeals = deals.length;

  return {
    pipeline,
    summary: {
      totalDeals,
      totalValue,
      avgDealSize: totalDeals > 0 ? totalValue / totalDeals : 0,
    },
  };
}

/**
 * Get sales forecast
 */
export async function getSalesForecast(userId: string): Promise<any> {
  const openDeals = await prisma.deal.findMany({
    where: {
      userId,
      deletedAt: null,
      stage: { notIn: ['closed_won', 'closed_lost'] },
    },
  });

  // Calculate weighted forecast (value * probability)
  const forecast = openDeals.reduce((sum, deal) => {
    return sum + (deal.value * deal.probability) / 100;
  }, 0);

  // Group by expected close month
  const byMonth: Record<string, { deals: number; value: number; weightedValue: number }> = {};

  for (const deal of openDeals) {
    if (!deal.expectedCloseDate) continue;

    const month = new Date(deal.expectedCloseDate).toISOString().slice(0, 7); // YYYY-MM
    if (!byMonth[month]) {
      byMonth[month] = { deals: 0, value: 0, weightedValue: 0 };
    }

    byMonth[month].deals += 1;
    byMonth[month].value += deal.value;
    byMonth[month].weightedValue += (deal.value * deal.probability) / 100;
  }

  return {
    totalForecast: forecast,
    totalPipeline: openDeals.reduce((sum, deal) => sum + deal.value, 0),
    dealCount: openDeals.length,
    byMonth,
  };
}

/**
 * Get deals by owner
 */
export async function getDealsByOwner(
  userId: string,
  ownerId: string
): Promise<Deal[]> {
  return prisma.deal.findMany({
    where: {
      userId,
      ownerId,
      deletedAt: null,
    },
    include: {
      company: true,
      contacts: {
        where: { deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
