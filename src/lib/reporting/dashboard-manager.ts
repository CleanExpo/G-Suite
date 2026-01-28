/**
 * UNI-175: Dashboard Manager Service
 */

import { prisma } from '@/lib/db';
import type {
  Dashboard,
  DashboardInput,
  DashboardUpdate,
  DashboardFilter,
  PaginationOptions,
  PaginatedResult,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Create Dashboard
// ────────────────────────────────────────────────────────────────────────────

export async function createDashboard(
  userId: string,
  input: DashboardInput
): Promise<Dashboard> {
  const dashboard = await prisma.dashboard.create({
    data: {
      userId,
      name: input.name,
      description: input.description || null,
      type: input.type || 'custom',
      layout: input.layout as any,
      isPublic: input.isPublic !== undefined ? input.isPublic : false,
      sharedWith: input.sharedWith || [],
      isDefault: input.isDefault !== undefined ? input.isDefault : false,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : 0,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return dashboard as unknown as Dashboard;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Dashboard by ID
// ────────────────────────────────────────────────────────────────────────────

export async function getDashboardById(
  userId: string,
  dashboardId: string
): Promise<Dashboard | null> {
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: dashboardId,
      OR: [
        { userId },
        { isPublic: true },
        { sharedWith: { has: userId } },
      ],
      deletedAt: null,
    },
  });

  return dashboard as unknown as Dashboard | null;
}

// ────────────────────────────────────────────────────────────────────────────
// List Dashboards
// ────────────────────────────────────────────────────────────────────────────

export async function listDashboards(
  userId: string,
  filter?: DashboardFilter,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Dashboard>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = pagination?.sortBy || 'sortOrder';
  const sortOrder = pagination?.sortOrder || 'asc';

  // Build where clause
  const where: any = {
    OR: [
      { userId },
      { isPublic: true },
      { sharedWith: { has: userId } },
    ],
    deletedAt: null,
  };

  if (filter?.type) {
    where.type = filter.type;
  }

  if (filter?.isPublic !== undefined) {
    where.isPublic = filter.isPublic;
  }

  if (filter?.isDefault !== undefined) {
    where.isDefault = filter.isDefault;
  }

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  // Execute query in parallel
  const [dashboards, totalCount] = await Promise.all([
    prisma.dashboard.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.dashboard.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: dashboards as unknown as Dashboard[],
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
// Update Dashboard
// ────────────────────────────────────────────────────────────────────────────

export async function updateDashboard(
  userId: string,
  dashboardId: string,
  update: DashboardUpdate
): Promise<Dashboard> {
  // Verify ownership
  const existing = await prisma.dashboard.findFirst({
    where: { id: dashboardId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Dashboard not found or access denied');
  }

  const dashboard = await prisma.dashboard.update({
    where: { id: dashboardId },
    data: {
      name: update.name,
      description: update.description,
      layout: update.layout ? (update.layout as any) : undefined,
      isPublic: update.isPublic,
      sharedWith: update.sharedWith,
      isDefault: update.isDefault,
      sortOrder: update.sortOrder,
      updatedBy: userId,
    },
  });

  return dashboard as unknown as Dashboard;
}

// ────────────────────────────────────────────────────────────────────────────
// Delete Dashboard
// ────────────────────────────────────────────────────────────────────────────

export async function deleteDashboard(userId: string, dashboardId: string): Promise<void> {
  // Verify ownership
  const existing = await prisma.dashboard.findFirst({
    where: { id: dashboardId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Dashboard not found or access denied');
  }

  await prisma.dashboard.update({
    where: { id: dashboardId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Get Default Dashboard
// ────────────────────────────────────────────────────────────────────────────

export async function getDefaultDashboard(userId: string): Promise<Dashboard | null> {
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      userId,
      isDefault: true,
      deletedAt: null,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return dashboard as unknown as Dashboard | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Set Default Dashboard
// ────────────────────────────────────────────────────────────────────────────

export async function setDefaultDashboard(
  userId: string,
  dashboardId: string
): Promise<Dashboard> {
  // Verify ownership
  const existing = await prisma.dashboard.findFirst({
    where: { id: dashboardId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Dashboard not found or access denied');
  }

  // Remove default from all user's dashboards
  await prisma.dashboard.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  // Set new default
  const dashboard = await prisma.dashboard.update({
    where: { id: dashboardId },
    data: {
      isDefault: true,
      updatedBy: userId,
    },
  });

  return dashboard as unknown as Dashboard;
}

// ────────────────────────────────────────────────────────────────────────────
// Clone Dashboard
// ────────────────────────────────────────────────────────────────────────────

export async function cloneDashboard(
  userId: string,
  dashboardId: string,
  newName: string
): Promise<Dashboard> {
  // Get original dashboard
  const original = await getDashboardById(userId, dashboardId);
  if (!original) {
    throw new Error('Dashboard not found or access denied');
  }

  // Create clone
  const clone = await prisma.dashboard.create({
    data: {
      userId,
      name: newName,
      description: original.description,
      type: original.type,
      layout: original.layout as any,
      isPublic: false,
      sharedWith: [],
      isDefault: false,
      sortOrder: original.sortOrder,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return clone as unknown as Dashboard;
}
