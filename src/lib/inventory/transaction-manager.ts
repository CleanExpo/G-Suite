/**
 * UNI-172: Transaction Manager
 *
 * Record and retrieve inventory transactions
 */

import prisma from '@/prisma';
import type { TransactionFilter, PaginatedResponse } from './types';

/**
 * Record an inventory transaction
 */
export async function recordTransaction(
  userId: string,
  data: {
    type: string;
    subType?: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    unitCost?: number;
    notes?: string;
    stockBefore: number;
    stockAfter: number;
    performedBy: string;
    referenceType?: string;
    referenceId?: string;
  }
) {
  return prisma.inventoryTransaction.create({
    data: {
      userId,
      ...data,
      totalCost: data.unitCost ? Math.abs(data.quantity) * data.unitCost : null,
    },
  });
}

/**
 * List transactions with filters and pagination
 */
export async function listTransactions(
  userId: string,
  filters: TransactionFilter = {},
  page = 1,
  limit = 50
): Promise<PaginatedResponse<any>> {
  const skip = (page - 1) * limit;
  const where: any = { userId, deletedAt: null };

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.warehouseId) {
    where.warehouseId = filters.warehouseId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const [items, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.inventoryTransaction.count({ where }),
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
 * Get transaction by ID
 */
export async function getTransactionById(userId: string, id: string) {
  return prisma.inventoryTransaction.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      product: true,
      warehouse: true,
    },
  });
}

/**
 * Get transaction history for a specific product
 */
export async function getProductHistory(
  userId: string,
  productId: string,
  limit = 50
) {
  return prisma.inventoryTransaction.findMany({
    where: {
      userId,
      productId,
      deletedAt: null,
    },
    include: {
      warehouse: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get transactions summary for a warehouse
 */
export async function getWarehouseTransactionSummary(
  userId: string,
  warehouseId: string,
  days = 30
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const transactions = await prisma.inventoryTransaction.findMany({
    where: {
      userId,
      warehouseId,
      deletedAt: null,
      createdAt: { gte: since },
    },
  });

  const summary = {
    totalTransactions: transactions.length,
    stockIn: 0,
    stockOut: 0,
    adjustments: 0,
    transfers: 0,
    totalValue: 0,
  };

  transactions.forEach((tx) => {
    if (tx.type === 'in') {
      summary.stockIn += tx.quantity;
    } else if (tx.type === 'out') {
      summary.stockOut += Math.abs(tx.quantity);
    } else if (tx.type === 'adjustment') {
      summary.adjustments += 1;
    } else if (tx.type === 'transfer') {
      summary.transfers += 1;
    }

    if (tx.totalCost) {
      summary.totalValue += tx.totalCost;
    }
  });

  return summary;
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(
  userId: string,
  limit = 10
) {
  return prisma.inventoryTransaction.findMany({
    where: { userId, deletedAt: null },
    include: {
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
        },
      },
      warehouse: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
