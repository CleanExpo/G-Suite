/**
 * UNI-171: CRM Task Manager
 *
 * CRUD operations for CRM tasks
 */

import prisma from '@/prisma';
import type { TaskInput, TaskFilter, TaskUpdate, PaginatedResponse } from './types';
import type { CRMTask } from '@prisma/client';

/**
 * Create a new CRM task
 */
export async function createTask(
  userId: string,
  data: TaskInput
): Promise<CRMTask> {
  return prisma.cRMTask.create({
    data: {
      ...data,
      userId,
      createdBy: userId,
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
  });
}

/**
 * List tasks with filtering and pagination
 */
export async function listTasks(
  userId: string,
  filters: TaskFilter = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<CRMTask>> {
  const skip = (page - 1) * limit;

  const where: any = { userId, deletedAt: null };

  // Apply filters
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.contactId) where.contactId = filters.contactId;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.dealId) where.dealId = filters.dealId;

  // Overdue filter
  if (filters.overdue) {
    where.dueDate = { lt: new Date() };
    where.status = { not: 'completed' };
  }

  const [items, total] = await Promise.all([
    prisma.cRMTask.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
      take: limit,
      skip,
    }),
    prisma.cRMTask.count({ where }),
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
 * Get task by ID
 */
export async function getTaskById(
  userId: string,
  id: string
): Promise<CRMTask | null> {
  return prisma.cRMTask.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      contact: true,
    },
  });
}

/**
 * Update task
 */
export async function updateTask(
  userId: string,
  id: string,
  data: TaskUpdate
): Promise<CRMTask | null> {
  // Verify ownership
  const existing = await prisma.cRMTask.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  // If marking as completed, set completedAt
  const updateData: any = { ...data };
  if (data.status === 'completed' && !data.completedAt) {
    updateData.completedAt = new Date();
  }

  return prisma.cRMTask.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
    include: {
      contact: true,
    },
  });
}

/**
 * Delete task (soft delete)
 */
export async function deleteTask(
  userId: string,
  id: string
): Promise<CRMTask | null> {
  // Verify ownership
  const existing = await prisma.cRMTask.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) return null;

  return prisma.cRMTask.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get tasks assigned to a user
 */
export async function getMyTasks(
  userId: string,
  assigneeId: string,
  statusFilter?: string
): Promise<CRMTask[]> {
  const where: any = {
    userId,
    assigneeId,
    deletedAt: null,
  };

  if (statusFilter) {
    where.status = statusFilter;
  }

  return prisma.cRMTask.findMany({
    where,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { dueDate: 'asc' },
    ],
  });
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(
  userId: string,
  assigneeId?: string
): Promise<CRMTask[]> {
  const where: any = {
    userId,
    deletedAt: null,
    status: { not: 'completed' },
    dueDate: { lt: new Date() },
  };

  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  return prisma.cRMTask.findMany({
    where,
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
}

/**
 * Get tasks for a contact
 */
export async function getContactTasks(
  userId: string,
  contactId: string
): Promise<CRMTask[]> {
  return prisma.cRMTask.findMany({
    where: {
      userId,
      contactId,
      deletedAt: null,
    },
    orderBy: [
      { status: 'asc' },
      { dueDate: 'asc' },
    ],
  });
}

/**
 * Get tasks for a company
 */
export async function getCompanyTasks(
  userId: string,
  companyId: string
): Promise<CRMTask[]> {
  return prisma.cRMTask.findMany({
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
    orderBy: [
      { status: 'asc' },
      { dueDate: 'asc' },
    ],
  });
}

/**
 * Get tasks for a deal
 */
export async function getDealTasks(
  userId: string,
  dealId: string
): Promise<CRMTask[]> {
  return prisma.cRMTask.findMany({
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
    orderBy: [
      { status: 'asc' },
      { dueDate: 'asc' },
    ],
  });
}
