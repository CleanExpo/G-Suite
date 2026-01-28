/**
 * UNI-174: Workflow Instance Manager
 */

import { prisma } from '@/lib/db';
import type {
  WorkflowInstance,
  WorkflowInstanceInput,
  WorkflowInstanceFilter,
  PaginationOptions,
  PaginatedResult,
  WorkflowStepsStatus,
  WorkflowInstanceStatus,
  ApprovalInput,
} from './types';
import { getWorkflowTemplateById } from './template-manager';

// ────────────────────────────────────────────────────────────────────────────
// Create Workflow Instance
// ────────────────────────────────────────────────────────────────────────────

export async function createWorkflowInstance(
  userId: string,
  input: WorkflowInstanceInput
): Promise<WorkflowInstance> {
  // Get template
  const template = await getWorkflowTemplateById(userId, input.templateId);
  if (!template) {
    throw new Error('Workflow template not found');
  }

  // Initialize steps status
  const stepsStatus: WorkflowStepsStatus = {};
  template.steps.forEach((step) => {
    stepsStatus[step.stepId] = {
      status: 'pending',
    };
  });

  // Set first step as current
  const firstStepId = template.steps.length > 0 ? template.steps[0].stepId : null;
  if (firstStepId) {
    stepsStatus[firstStepId].status = 'in_progress';
  }

  // Calculate SLA deadline
  const slaDeadline = template.slaHours
    ? new Date(Date.now() + template.slaHours * 60 * 60 * 1000)
    : null;

  const instance = await prisma.workflowInstance.create({
    data: {
      userId,
      templateId: input.templateId,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      status: 'in_progress',
      currentStepId: firstStepId,
      stepsStatus: stepsStatus as any,
      slaDeadline,
      isOverdue: false,
      metadata: input.metadata ? (input.metadata as any) : null,
    },
  });

  return instance as unknown as WorkflowInstance;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Workflow Instance by ID
// ────────────────────────────────────────────────────────────────────────────

export async function getWorkflowInstanceById(
  userId: string,
  instanceId: string
): Promise<WorkflowInstance | null> {
  const instance = await prisma.workflowInstance.findFirst({
    where: {
      id: instanceId,
      userId,
    },
    include: {
      template: true,
    },
  });

  return instance as WorkflowInstance | null;
}

// ────────────────────────────────────────────────────────────────────────────
// List Workflow Instances
// ────────────────────────────────────────────────────────────────────────────

export async function listWorkflowInstances(
  userId: string,
  filter?: WorkflowInstanceFilter,
  pagination?: PaginationOptions
): Promise<PaginatedResult<WorkflowInstance>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = pagination?.sortBy || 'createdAt';
  const sortOrder = pagination?.sortOrder || 'desc';

  // Build where clause
  const where: any = {
    userId,
  };

  if (filter?.templateId) {
    where.templateId = filter.templateId;
  }

  if (filter?.status) {
    where.status = filter.status;
  }

  if (filter?.referenceType) {
    where.referenceType = filter.referenceType;
  }

  if (filter?.referenceId) {
    where.referenceId = filter.referenceId;
  }

  if (filter?.isOverdue !== undefined) {
    where.isOverdue = filter.isOverdue;
  }

  if (filter?.fromDate || filter?.toDate) {
    where.createdAt = {};
    if (filter.fromDate) {
      where.createdAt.gte = filter.fromDate;
    }
    if (filter.toDate) {
      where.createdAt.lte = filter.toDate;
    }
  }

  // Execute query in parallel
  const [instances, totalCount] = await Promise.all([
    prisma.workflowInstance.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        template: true,
      },
    }),
    prisma.workflowInstance.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: instances as unknown as WorkflowInstance[],
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
// Update Workflow Instance Status
// ────────────────────────────────────────────────────────────────────────────

export async function updateWorkflowInstanceStatus(
  userId: string,
  instanceId: string,
  status: WorkflowInstanceStatus
): Promise<WorkflowInstance> {
  // Verify ownership
  const existing = await getWorkflowInstanceById(userId, instanceId);
  if (!existing) {
    throw new Error('Workflow instance not found');
  }

  const updateData: any = {
    status,
  };

  if (status === 'completed') {
    updateData.completedAt = new Date();
  }

  const instance = await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: updateData,
  });

  return instance as unknown as WorkflowInstance;
}

// ────────────────────────────────────────────────────────────────────────────
// Update Step Status
// ────────────────────────────────────────────────────────────────────────────

export async function updateStepStatus(
  userId: string,
  instanceId: string,
  stepId: string,
  statusUpdate: any
): Promise<WorkflowInstance> {
  // Verify ownership
  const existing = await getWorkflowInstanceById(userId, instanceId);
  if (!existing) {
    throw new Error('Workflow instance not found');
  }

  const stepsStatus = { ...existing.stepsStatus };
  stepsStatus[stepId] = {
    ...stepsStatus[stepId],
    ...statusUpdate,
  };

  const instance = await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: {
      stepsStatus: stepsStatus as any,
    },
  });

  return instance as unknown as WorkflowInstance;
}

// ────────────────────────────────────────────────────────────────────────────
// Move to Next Step
// ────────────────────────────────────────────────────────────────────────────

export async function moveToNextStep(
  userId: string,
  instanceId: string,
  nextStepId: string | null
): Promise<WorkflowInstance> {
  // Verify ownership
  const existing = await getWorkflowInstanceById(userId, instanceId);
  if (!existing) {
    throw new Error('Workflow instance not found');
  }

  const updateData: any = {
    currentStepId: nextStepId,
  };

  // If no next step, mark as completed
  if (!nextStepId) {
    updateData.status = 'completed';
    updateData.completedAt = new Date();
  }

  const instance = await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: updateData,
  });

  return instance as unknown as WorkflowInstance;
}

// ────────────────────────────────────────────────────────────────────────────
// Cancel Workflow Instance
// ────────────────────────────────────────────────────────────────────────────

export async function cancelWorkflowInstance(
  userId: string,
  instanceId: string,
  cancelReason?: string
): Promise<WorkflowInstance> {
  // Verify ownership
  const existing = await getWorkflowInstanceById(userId, instanceId);
  if (!existing) {
    throw new Error('Workflow instance not found');
  }

  const instance = await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: cancelReason || 'Cancelled by user',
    },
  });

  return instance as unknown as WorkflowInstance;
}

// ────────────────────────────────────────────────────────────────────────────
// Check and Update Overdue Status
// ────────────────────────────────────────────────────────────────────────────

export async function checkOverdueInstances(userId: string): Promise<void> {
  await prisma.workflowInstance.updateMany({
    where: {
      userId,
      status: {
        in: ['pending', 'in_progress'],
      },
      slaDeadline: {
        not: null,
        lte: new Date(),
      },
      isOverdue: false,
    },
    data: {
      isOverdue: true,
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Get Instances by Reference
// ────────────────────────────────────────────────────────────────────────────

export async function getInstancesByReference(
  userId: string,
  referenceType: string,
  referenceId: string
): Promise<WorkflowInstance[]> {
  const instances = await prisma.workflowInstance.findMany({
    where: {
      userId,
      referenceType,
      referenceId,
    },
    include: {
      template: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return instances as unknown as WorkflowInstance[];
}

// ────────────────────────────────────────────────────────────────────────────
// Get Pending Approvals for User
// ────────────────────────────────────────────────────────────────────────────

export async function getPendingApprovalsForUser(
  userId: string,
  assigneeId: string
): Promise<WorkflowInstance[]> {
  // This would typically check the current step's assignee
  // For now, return all in-progress instances
  const instances = await prisma.workflowInstance.findMany({
    where: {
      userId,
      status: 'in_progress',
    },
    include: {
      template: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return instances as unknown as WorkflowInstance[];
}
