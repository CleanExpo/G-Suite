/**
 * UNI-171: Company Manager
 *
 * CRUD operations for CRM companies
 */

import prisma from '@/prisma';
import type { CompanyInput, CompanyFilter, CompanyUpdate, PaginatedResponse } from './types';
import type { Company } from '@prisma/client';

/**
 * Create a new company
 */
export async function createCompany(
  userId: string,
  data: CompanyInput
): Promise<Company> {
  return prisma.company.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      parentCompany: true,
      contacts: {
        where: { deletedAt: null },
        take: 5,
      },
      deals: {
        where: { deletedAt: null },
        take: 5,
      },
    },
  });
}

/**
 * List companies with filtering and pagination
 */
export async function listCompanies(
  userId: string,
  filters: CompanyFilter = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Company>> {
  const skip = (page - 1) * limit;

  const where: any = { userId, deletedAt: null };

  // Apply filters
  if (filters.status) where.status = filters.status;
  if (filters.industry) where.industry = filters.industry;
  if (filters.parentCompanyId) where.parentCompanyId = filters.parentCompanyId;

  // Search across multiple fields
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { legalName: { contains: filters.search, mode: 'insensitive' } },
      { website: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        parentCompany: true,
        _count: {
          select: {
            contacts: { where: { deletedAt: null } },
            deals: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.company.count({ where }),
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
 * Get company by ID
 */
export async function getCompanyById(
  userId: string,
  id: string
): Promise<Company | null> {
  return prisma.company.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      parentCompany: true,
      childCompanies: {
        where: { deletedAt: null },
      },
      contacts: {
        where: { deletedAt: null },
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'desc' },
        ],
      },
      deals: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

/**
 * Update company
 */
export async function updateCompany(
  userId: string,
  id: string,
  data: CompanyUpdate
): Promise<Company | null> {
  // Verify ownership
  const existing = await prisma.company.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.company.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    },
    include: {
      parentCompany: true,
      contacts: {
        where: { deletedAt: null },
        take: 5,
      },
    },
  });
}

/**
 * Delete company (soft delete)
 */
export async function deleteCompany(
  userId: string,
  id: string
): Promise<Company | null> {
  // Verify ownership
  const existing = await prisma.company.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.company.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get company hierarchy (parent and children)
 */
export async function getCompanyHierarchy(
  userId: string,
  id: string
): Promise<any> {
  const company = await getCompanyById(userId, id);
  if (!company) return null;

  // Get all descendants recursively
  const descendants = await getCompanyDescendants(userId, id);

  return {
    company,
    descendants,
  };
}

/**
 * Helper: Get all company descendants recursively
 */
async function getCompanyDescendants(
  userId: string,
  parentId: string,
  depth = 0,
  maxDepth = 5
): Promise<Company[]> {
  if (depth >= maxDepth) return [];

  const children = await prisma.company.findMany({
    where: {
      userId,
      parentCompanyId: parentId,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          contacts: { where: { deletedAt: null } },
          deals: { where: { deletedAt: null } },
        },
      },
    },
  });

  const allDescendants: Company[] = [...children];

  for (const child of children) {
    const grandchildren = await getCompanyDescendants(userId, child.id, depth + 1, maxDepth);
    allDescendants.push(...grandchildren);
  }

  return allDescendants;
}

/**
 * Get companies by industry
 */
export async function getCompaniesByIndustry(
  userId: string,
  industry: string
): Promise<Company[]> {
  return prisma.company.findMany({
    where: {
      userId,
      industry,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          contacts: { where: { deletedAt: null } },
          deals: { where: { deletedAt: null } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}
