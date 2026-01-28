/**
 * UNI-172: Stock Manager
 *
 * Stock level operations, adjustments, transfers, and alerts
 */

import prisma from '@/prisma';
import type { StockAdjustmentInput, StockTransferInput, LowStockAlert } from './types';
import { recordTransaction } from './transaction-manager';

/**
 * Adjust stock levels (in, out, or absolute adjustment)
 */
export async function adjustStock(
  userId: string,
  adjustment: StockAdjustmentInput
) {
  const { productId, warehouseId, quantity, type, subType, notes, unitCost } = adjustment;

  // Get current product
  const product = await prisma.product.findFirst({
    where: { id: productId, userId, deletedAt: null },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Calculate new stock level
  const stockBefore = product.stockLevel;
  let stockAfter = stockBefore;

  if (type === 'in') {
    stockAfter = stockBefore + quantity;
  } else if (type === 'out') {
    stockAfter = stockBefore - quantity;
    if (stockAfter < 0) {
      throw new Error('Insufficient stock');
    }
  } else if (type === 'adjustment') {
    stockAfter = quantity; // Set absolute value
  }

  // Update product stock level
  await prisma.product.update({
    where: { id: productId },
    data: {
      stockLevel: stockAfter,
      updatedBy: userId,
      updatedAt: new Date(),
    },
  });

  // Update or create stock location (default/primary location without specific zones)
  const existingLocation = await prisma.stockLocation.findFirst({
    where: {
      userId,
      warehouseId,
      productId,
      zone: null,
      aisle: null,
      rack: null,
      shelf: null,
      bin: null,
      deletedAt: null,
    },
  });

  if (existingLocation) {
    await prisma.stockLocation.update({
      where: { id: existingLocation.id },
      data: {
        quantity: stockAfter,
        availableQuantity: stockAfter,
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.stockLocation.create({
      data: {
        userId,
        warehouseId,
        productId,
        quantity: stockAfter,
        availableQuantity: stockAfter,
        isPrimary: true,
      },
    });
  }

  // Record transaction
  await recordTransaction(userId, {
    type,
    subType,
    productId,
    warehouseId,
    quantity: type === 'out' ? -quantity : quantity,
    unitCost,
    notes,
    stockBefore,
    stockAfter,
    performedBy: userId,
  });

  return { stockBefore, stockAfter };
}

/**
 * Transfer stock between warehouses
 */
export async function transferStock(
  userId: string,
  transfer: StockTransferInput
) {
  const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = transfer;

  // Validate quantity
  if (quantity <= 0) {
    throw new Error('Transfer quantity must be positive');
  }

  // Deduct from source warehouse
  await adjustStock(userId, {
    productId,
    warehouseId: fromWarehouseId,
    quantity,
    type: 'out',
    subType: 'transfer',
    notes: `Transfer to warehouse ${toWarehouseId}: ${notes || ''}`,
  });

  // Add to destination warehouse
  await adjustStock(userId, {
    productId,
    warehouseId: toWarehouseId,
    quantity,
    type: 'in',
    subType: 'transfer',
    notes: `Transfer from warehouse ${fromWarehouseId}: ${notes || ''}`,
  });

  return { success: true };
}

/**
 * Get stock levels across all warehouses for a product
 */
export async function getStockLevels(
  userId: string,
  productId?: string
) {
  const where: any = { userId, deletedAt: null };

  if (productId) {
    where.productId = productId;
  }

  return prisma.stockLocation.findMany({
    where,
    include: {
      product: true,
      warehouse: true,
    },
    orderBy: [
      { product: { name: 'asc' } },
      { warehouse: { name: 'asc' } },
    ],
  });
}

/**
 * Get low stock alerts for products below reorder point
 */
export async function getLowStockAlerts(userId: string): Promise<LowStockAlert[]> {
  const products = await prisma.product.findMany({
    where: {
      userId,
      deletedAt: null,
      trackInventory: true,
      stockLevel: {
        lte: prisma.product.fields.reorderPoint,
      },
    },
    orderBy: { stockLevel: 'asc' },
  });

  return products.map((product) => ({
    productId: product.id,
    sku: product.sku,
    name: product.name,
    currentStock: product.stockLevel,
    reorderPoint: product.reorderPoint,
    reorderQuantity: product.reorderQuantity,
    deficit: product.reorderPoint - product.stockLevel,
  }));
}

/**
 * Get total stock value
 */
export async function getTotalStockValue(userId: string): Promise<number> {
  const products = await prisma.product.findMany({
    where: {
      userId,
      deletedAt: null,
      trackInventory: true,
    },
    select: {
      stockLevel: true,
      unitCost: true,
    },
  });

  return products.reduce((total, product) => {
    return total + (product.stockLevel * product.unitCost);
  }, 0);
}

/**
 * Reserve stock for an order (reduces available quantity)
 */
export async function reserveStock(
  userId: string,
  productId: string,
  warehouseId: string,
  quantity: number
) {
  // Get stock location
  const location = await prisma.stockLocation.findFirst({
    where: {
      userId,
      productId,
      warehouseId,
      deletedAt: null,
    },
  });

  if (!location) {
    throw new Error('Stock location not found');
  }

  if (location.availableQuantity < quantity) {
    throw new Error('Insufficient available stock');
  }

  // Update reserved quantity
  return prisma.stockLocation.update({
    where: { id: location.id },
    data: {
      reservedQuantity: location.reservedQuantity + quantity,
      availableQuantity: location.availableQuantity - quantity,
      updatedAt: new Date(),
    },
  });
}

/**
 * Release reserved stock (increases available quantity)
 */
export async function releaseStock(
  userId: string,
  productId: string,
  warehouseId: string,
  quantity: number
) {
  // Get stock location
  const location = await prisma.stockLocation.findFirst({
    where: {
      userId,
      productId,
      warehouseId,
      deletedAt: null,
    },
  });

  if (!location) {
    throw new Error('Stock location not found');
  }

  if (location.reservedQuantity < quantity) {
    throw new Error('Cannot release more than reserved');
  }

  // Update reserved quantity
  return prisma.stockLocation.update({
    where: { id: location.id },
    data: {
      reservedQuantity: location.reservedQuantity - quantity,
      availableQuantity: location.availableQuantity + quantity,
      updatedAt: new Date(),
    },
  });
}
