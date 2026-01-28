/**
 * UNI-172: Warehouse Manager
 *
 * CRUD operations for warehouses
 */

import prisma from '@/prisma';
import type { WarehouseInput, WarehouseFilter } from './types';

/**
 * Create a new warehouse
 */
export async function createWarehouse(
  userId: string,
  data: WarehouseInput
) {
  return prisma.warehouse.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
      updatedBy: userId,
    },
  });
}

/**
 * List warehouses with filters
 */
export async function listWarehouses(
  userId: string,
  filters: WarehouseFilter = {}
) {
  const where: any = { userId, deletedAt: null };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  return prisma.warehouse.findMany({
    where,
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

/**
 * Get warehouse by ID with stock locations
 */
export async function getWarehouseById(userId: string, id: string) {
  return prisma.warehouse.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      stockLocations: {
        include: { product: true },
        where: { deletedAt: null },
      },
    },
  });
}

/**
 * Update warehouse
 */
export async function updateWarehouse(
  userId: string,
  id: string,
  data: Partial<WarehouseInput>
) {
  // Ownership verification
  const existing = await prisma.warehouse.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) {
    return null;
  }

  return prisma.warehouse.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    },
  });
}

/**
 * Soft delete warehouse
 */
export async function deleteWarehouse(userId: string, id: string) {
  const existing = await prisma.warehouse.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) {
    return null;
  }

  return prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get stock levels for a specific warehouse
 */
export async function getWarehouseStockLevels(
  userId: string,
  warehouseId: string
) {
  return prisma.stockLocation.findMany({
    where: {
      userId,
      warehouseId,
      deletedAt: null,
    },
    include: {
      product: true,
    },
    orderBy: { product: { name: 'asc' } },
  });
}

/**
 * Get default warehouse for user
 */
export async function getDefaultWarehouse(userId: string) {
  return prisma.warehouse.findFirst({
    where: {
      userId,
      isDefault: true,
      deletedAt: null,
    },
  });
}

/**
 * Set warehouse as default (removes default from others)
 */
export async function setDefaultWarehouse(userId: string, id: string) {
  // First, verify ownership
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!warehouse) {
    return null;
  }

  // Remove default from all warehouses
  await prisma.warehouse.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  // Set this warehouse as default
  return prisma.warehouse.update({
    where: { id },
    data: { isDefault: true, updatedAt: new Date() },
  });
}
