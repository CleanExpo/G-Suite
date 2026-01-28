/**
 * UNI-174: Workflow Template Manager
 */

import { prisma } from '@/lib/db';
import type {
  WorkflowTemplate,
  WorkflowTemplateInput,
  WorkflowTemplateUpdate,
  WorkflowTemplateFilter,
  PaginationOptions,
  PaginatedResult,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Create Workflow Template
// ────────────────────────────────────────────────────────────────────────────

export async function createWorkflowTemplate(
  userId: string,
  input: WorkflowTemplateInput
): Promise<WorkflowTemplate> {
  const template = await prisma.workflowTemplate.create({
    data: {
      userId,
      name: input.name,
      description: input.description || null,
      type: input.type,
      triggerEvent: input.triggerEvent,
      steps: input.steps as any,
      slaHours: input.slaHours || null,
      escalationRules: input.escalationRules ? (input.escalationRules as any) : null,
      isActive: input.isActive !== undefined ? input.isActive : true,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return template as unknown as WorkflowTemplate;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Workflow Template by ID
// ────────────────────────────────────────────────────────────────────────────

export async function getWorkflowTemplateById(
  userId: string,
  templateId: string
): Promise<WorkflowTemplate | null> {
  const template = await prisma.workflowTemplate.findFirst({
    where: {
      id: templateId,
      userId,
      deletedAt: null,
    },
  });

  return template as WorkflowTemplate | null;
}

// ────────────────────────────────────────────────────────────────────────────
// List Workflow Templates
// ────────────────────────────────────────────────────────────────────────────

export async function listWorkflowTemplates(
  userId: string,
  filter?: WorkflowTemplateFilter,
  pagination?: PaginationOptions
): Promise<PaginatedResult<WorkflowTemplate>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = pagination?.sortBy || 'createdAt';
  const sortOrder = pagination?.sortOrder || 'desc';

  // Build where clause
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (filter?.type) {
    where.type = filter.type;
  }

  if (filter?.triggerEvent) {
    where.triggerEvent = filter.triggerEvent;
  }

  if (filter?.isActive !== undefined) {
    where.isActive = filter.isActive;
  }

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  // Execute query in parallel
  const [templates, totalCount] = await Promise.all([
    prisma.workflowTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.workflowTemplate.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: templates as unknown as WorkflowTemplate[],
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
// Update Workflow Template
// ────────────────────────────────────────────────────────────────────────────

export async function updateWorkflowTemplate(
  userId: string,
  templateId: string,
  update: WorkflowTemplateUpdate
): Promise<WorkflowTemplate> {
  // Verify ownership
  const existing = await getWorkflowTemplateById(userId, templateId);
  if (!existing) {
    throw new Error('Workflow template not found');
  }

  const template = await prisma.workflowTemplate.update({
    where: { id: templateId },
    data: {
      name: update.name,
      description: update.description,
      steps: update.steps ? (update.steps as any) : undefined,
      slaHours: update.slaHours !== undefined ? update.slaHours : undefined,
      escalationRules:
        update.escalationRules !== undefined ? (update.escalationRules as any) : undefined,
      isActive: update.isActive,
      updatedBy: userId,
    },
  });

  return template as unknown as WorkflowTemplate;
}

// ────────────────────────────────────────────────────────────────────────────
// Delete Workflow Template (Soft Delete)
// ────────────────────────────────────────────────────────────────────────────

export async function deleteWorkflowTemplate(userId: string, templateId: string): Promise<void> {
  // Verify ownership
  const existing = await getWorkflowTemplateById(userId, templateId);
  if (!existing) {
    throw new Error('Workflow template not found');
  }

  await prisma.workflowTemplate.update({
    where: { id: templateId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Activate/Deactivate Workflow Template
// ────────────────────────────────────────────────────────────────────────────

export async function toggleWorkflowTemplateStatus(
  userId: string,
  templateId: string,
  isActive: boolean
): Promise<WorkflowTemplate> {
  // Verify ownership
  const existing = await getWorkflowTemplateById(userId, templateId);
  if (!existing) {
    throw new Error('Workflow template not found');
  }

  const template = await prisma.workflowTemplate.update({
    where: { id: templateId },
    data: {
      isActive,
      updatedBy: userId,
    },
  });

  return template as unknown as WorkflowTemplate;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Active Templates by Trigger Event
// ────────────────────────────────────────────────────────────────────────────

export async function getActiveTemplatesByTrigger(
  userId: string,
  triggerEvent: string
): Promise<WorkflowTemplate[]> {
  const templates = await prisma.workflowTemplate.findMany({
    where: {
      userId,
      triggerEvent,
      isActive: true,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return templates as unknown as WorkflowTemplate[];
}

// ────────────────────────────────────────────────────────────────────────────
// Clone Workflow Template
// ────────────────────────────────────────────────────────────────────────────

export async function cloneWorkflowTemplate(
  userId: string,
  templateId: string,
  newName: string
): Promise<WorkflowTemplate> {
  // Get original template
  const original = await getWorkflowTemplateById(userId, templateId);
  if (!original) {
    throw new Error('Workflow template not found');
  }

  // Create clone
  const clone = await prisma.workflowTemplate.create({
    data: {
      userId,
      name: newName,
      description: original.description,
      type: original.type,
      triggerEvent: original.triggerEvent,
      steps: original.steps as any,
      slaHours: original.slaHours,
      escalationRules: original.escalationRules as any,
      isActive: false, // Start inactive
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return clone as unknown as WorkflowTemplate;
}
