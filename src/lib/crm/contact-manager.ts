/**
 * UNI-171: Contact Manager
 *
 * CRUD operations for CRM contacts
 */

import prisma from '@/prisma';
import type { ContactInput, ContactFilter, ContactUpdate, PaginatedResponse } from './types';
import type { Contact } from '@prisma/client';

/**
 * Create a new contact
 */
export async function createContact(
  userId: string,
  data: ContactInput
): Promise<Contact> {
  return prisma.contact.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      company: true,
      deal: true,
    },
  });
}

/**
 * List contacts with filtering and pagination
 */
export async function listContacts(
  userId: string,
  filters: ContactFilter = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Contact>> {
  const skip = (page - 1) * limit;

  const where: any = { userId, deletedAt: null };

  // Apply filters
  if (filters.status) where.status = filters.status;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.leadScore !== undefined) where.leadScore = { gte: filters.leadScore };

  // Search across multiple fields
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Tag filtering
  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        company: true,
        deal: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.contact.count({ where }),
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
 * Get contact by ID
 */
export async function getContactById(
  userId: string,
  id: string
): Promise<Contact | null> {
  return prisma.contact.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      company: true,
      deal: true,
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      crmTasks: {
        where: { status: { not: 'completed' } },
        orderBy: { dueDate: 'asc' },
      },
    },
  });
}

/**
 * Update contact
 */
export async function updateContact(
  userId: string,
  id: string,
  data: ContactUpdate
): Promise<Contact | null> {
  // Verify ownership
  const existing = await prisma.contact.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.contact.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    },
    include: {
      company: true,
      deal: true,
    },
  });
}

/**
 * Delete contact (soft delete)
 */
export async function deleteContact(
  userId: string,
  id: string
): Promise<Contact | null> {
  // Verify ownership
  const existing = await prisma.contact.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.contact.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get contacts by company
 */
export async function getContactsByCompany(
  userId: string,
  companyId: string
): Promise<Contact[]> {
  return prisma.contact.findMany({
    where: {
      userId,
      companyId,
      deletedAt: null,
    },
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Get contacts by deal
 */
export async function getContactsByDeal(
  userId: string,
  dealId: string
): Promise<Contact[]> {
  return prisma.contact.findMany({
    where: {
      userId,
      dealId,
      deletedAt: null,
    },
    include: {
      company: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update lead score
 */
export async function updateLeadScore(
  userId: string,
  id: string,
  leadScore: number
): Promise<Contact | null> {
  const existing = await prisma.contact.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.contact.update({
    where: { id },
    data: {
      leadScore,
      updatedBy: userId,
      updatedAt: new Date(),
    },
  });
}
