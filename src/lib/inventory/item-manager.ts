/**
 * UNI-172: Product/Item Manager
 *
 * CRUD operations for inventory products following CRM patterns
 */

import prisma from '@/prisma';
import type { ProductInput, ProductFilter, PaginatedResponse } from './types';

/**
 * Create a new product
 */
export async function createProduct(
  userId: string,
  data: ProductInput
) {
  return prisma.product.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
      updatedBy: userId,
    },
  });
}

/**
 * List products with filters and pagination
 */
export async function listProducts(
  userId: string,
  filters: ProductFilter = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<any>> {
  const skip = (page - 1) * limit;
  const where: any = { userId, deletedAt: null };

  // Apply filters
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.lowStock) {
    // Filter for products where stock is at or below reorder point
    where.AND = [
      { trackInventory: true },
      { stockLevel: { lte: prisma.product.fields.reorderPoint } },
    ];
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
      { barcode: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Execute parallel queries for items and count
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
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
 * Get product by ID with relationships
 */
export async function getProductById(userId: string, id: string) {
  return prisma.product.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      stockLocations: {
        include: { warehouse: true },
        where: { deletedAt: null },
      },
      inventoryTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        where: { deletedAt: null },
        include: { warehouse: true },
      },
    },
  });
}

/**
 * Update product
 */
export async function updateProduct(
  userId: string,
  id: string,
  data: Partial<ProductInput>
) {
  // Ownership verification
  const existing = await prisma.product.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) {
    return null;
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    },
  });
}

/**
 * Soft delete product
 */
export async function deleteProduct(userId: string, id: string) {
  const existing = await prisma.product.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) {
    return null;
  }

  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Search products by SKU or barcode (exact match)
 */
export async function searchProducts(
  userId: string,
  query: string
) {
  return prisma.product.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [
        { sku: { equals: query } },
        { barcode: { equals: query } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 10,
  });
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  userId: string,
  category: string
) {
  return prisma.product.findMany({
    where: {
      userId,
      category,
      deletedAt: null,
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get all product categories for user
 */
export async function getProductCategories(userId: string): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { userId, deletedAt: null },
    select: { category: true },
    distinct: ['category'],
  });

  return products
    .map((p) => p.category)
    .filter((c): c is string => c !== null && c !== undefined);
}
