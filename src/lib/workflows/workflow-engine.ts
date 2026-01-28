/**
 * UNI-174: Workflow Engine
 * Handles workflow execution, approval routing, and SLA tracking
 */

import {
  createWorkflowInstance,
  getWorkflowInstanceById,
  updateStepStatus,
  moveToNextStep,
  updateWorkflowInstanceStatus,
  checkOverdueInstances,
} from './instance-manager';
import { getActiveTemplatesByTrigger, getWorkflowTemplateById } from './template-manager';
import { createNotification, sendNotification } from './notification-manager';
import type {
  WorkflowStep,
  WorkflowTemplate,
  WorkflowInstance,
  ApprovalInput,
  WorkflowExecutionContext,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Trigger Workflow by Event
// ────────────────────────────────────────────────────────────────────────────

export async function triggerWorkflow(
  userId: string,
  triggerEvent: string,
  referenceType: string,
  referenceId: string,
  referenceData?: Record<string, unknown>
): Promise<WorkflowInstance[]> {
  // Get all active templates for this trigger event
  const templates = await getActiveTemplatesByTrigger(userId, triggerEvent);

  if (templates.length === 0) {
    return [];
  }

  const instances: WorkflowInstance[] = [];

  // Create workflow instance for each template
  for (const template of templates) {
    // Check if template conditions are met
    const shouldTrigger = evaluateTemplateConditions(template, referenceData);

    if (shouldTrigger) {
      const instance = await createWorkflowInstance(userId, {
        templateId: template.id,
        referenceType,
        referenceId,
        metadata: referenceData,
      });

      instances.push(instance);

      // Start executing the workflow
      await executeWorkflow(userId, instance.id);
    }
  }

  return instances;
}

// ────────────────────────────────────────────────────────────────────────────
// Execute Workflow
// ────────────────────────────────────────────────────────────────────────────

export async function executeWorkflow(userId: string, instanceId: string): Promise<void> {
  const instance = await getWorkflowInstanceById(userId, instanceId);
  if (!instance) {
    throw new Error('Workflow instance not found');
  }

  if (instance.status !== 'in_progress') {
    return;
  }

  // Fetch the template
  const template = await getWorkflowTemplateById(userId, instance.templateId);
  if (!template) {
    throw new Error('Workflow template not found');
  }

  const currentStep = template.steps.find((s) => s.stepId === instance.currentStepId);

  if (!currentStep) {
    // No current step, workflow is complete
    await updateWorkflowInstanceStatus(userId, instanceId, 'completed');
    return;
  }

  // Execute current step
  await executeStep(userId, instance, template, currentStep);
}

// ────────────────────────────────────────────────────────────────────────────
// Execute Single Step
// ────────────────────────────────────────────────────────────────────────────

async function executeStep(
  userId: string,
  instance: WorkflowInstance,
  template: WorkflowTemplate,
  step: WorkflowStep
): Promise<void> {
  try {
    switch (step.type) {
      case 'approval':
        await handleApprovalStep(userId, instance, step);
        break;

      case 'notification':
        await handleNotificationStep(userId, instance, step);
        // Auto-complete notification steps
        await completeStep(userId, instance.id, step.stepId);
        break;

      case 'automation':
        await handleAutomationStep(userId, instance, step);
        // Auto-complete automation steps
        await completeStep(userId, instance.id, step.stepId);
        break;

      case 'condition':
        await handleConditionStep(userId, instance, step);
        break;

      case 'delay':
        await handleDelayStep(userId, instance, step);
        break;
    }
  } catch (error: any) {
    // Mark step as failed
    await updateStepStatus(userId, instance.id, step.stepId, {
      status: 'failed',
      failedAt: new Date().toISOString(),
      failureReason: error.message,
    });

    // Mark instance as failed
    await updateWorkflowInstanceStatus(userId, instance.id, 'failed');
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Handle Approval Step
// ────────────────────────────────────────────────────────────────────────────

async function handleApprovalStep(
  userId: string,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<void> {
  // Send approval notification
  if (step.actions) {
    for (const action of step.actions) {
      if (action.type === 'email') {
        const notification = await createNotification(userId, {
          type: 'email',
          channel: action.to as string,
          subject: action.subject || `Approval Required: ${step.name}`,
          body: action.body || `Please approve workflow step: ${step.name}`,
          triggerEvent: 'workflow.approved',
          referenceType: instance.referenceType,
          referenceId: instance.referenceId,
        });

        await sendNotification(userId, notification.id);
      }
    }
  }

  // Mark step as in_progress (waiting for approval)
  await updateStepStatus(userId, instance.id, step.stepId, {
    status: 'in_progress',
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Handle Notification Step
// ────────────────────────────────────────────────────────────────────────────

async function handleNotificationStep(
  userId: string,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<void> {
  if (!step.actions) {
    return;
  }

  for (const action of step.actions) {
    if (action.type === 'email') {
      const notification = await createNotification(userId, {
        type: 'email',
        channel: action.to as string,
        subject: action.subject || 'Workflow Notification',
        body: action.body || '',
        triggerEvent: 'workflow.completed',
        referenceType: instance.referenceType,
        referenceId: instance.referenceId,
      });

      await sendNotification(userId, notification.id);
    } else if (action.type === 'webhook') {
      const notification = await createNotification(userId, {
        type: 'webhook',
        channel: action.url,
        subject: 'Webhook Trigger',
        body: JSON.stringify(action.payload || {}),
        triggerEvent: 'workflow.completed',
        referenceType: instance.referenceType,
        referenceId: instance.referenceId,
      });

      await sendNotification(userId, notification.id);
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Handle Automation Step
// ────────────────────────────────────────────────────────────────────────────

async function handleAutomationStep(
  userId: string,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<void> {
  // TODO: Implement automation logic
  // This could update fields, create records, trigger external systems, etc.
  console.log(`Executing automation step: ${step.name}`);
}

// ────────────────────────────────────────────────────────────────────────────
// Handle Condition Step
// ────────────────────────────────────────────────────────────────────────────

async function handleConditionStep(
  userId: string,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<void> {
  // Evaluate condition
  const conditionMet = evaluateCondition(step.condition, instance.metadata);

  // Move to next step based on condition
  const nextStepId = conditionMet ? step.onApprove : step.onReject;

  await completeStep(userId, instance.id, step.stepId, nextStepId);
}

// ────────────────────────────────────────────────────────────────────────────
// Handle Delay Step
// ────────────────────────────────────────────────────────────────────────────

async function handleDelayStep(
  userId: string,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<void> {
  // TODO: Implement delay logic using a queue system (BullMQ)
  // For now, just mark as completed immediately
  console.log(`Delay step: ${step.name} (${step.delayMinutes} minutes)`);
  await completeStep(userId, instance.id, step.stepId);
}

// ────────────────────────────────────────────────────────────────────────────
// Process Approval
// ────────────────────────────────────────────────────────────────────────────

export async function processApproval(
  userId: string,
  input: ApprovalInput
): Promise<WorkflowInstance> {
  const instance = await getWorkflowInstanceById(userId, input.instanceId);
  if (!instance) {
    throw new Error('Workflow instance not found');
  }

  // Fetch the template
  const template = await getWorkflowTemplateById(userId, instance.templateId);
  if (!template) {
    throw new Error('Workflow template not found');
  }

  const currentStep = template.steps.find((s) => s.stepId === input.stepId);

  if (!currentStep) {
    throw new Error('Step not found');
  }

  // Update step status
  await updateStepStatus(userId, input.instanceId, input.stepId, {
    status: input.approved ? 'approved' : 'rejected',
    approvedBy: input.approved ? input.approvedBy : undefined,
    rejectedBy: !input.approved ? input.approvedBy : undefined,
    approvedAt: input.approved ? new Date().toISOString() : undefined,
    rejectedAt: !input.approved ? new Date().toISOString() : undefined,
    metadata: { comment: input.comment },
  });

  // Determine next step
  const nextStepId = input.approved ? currentStep.onApprove : currentStep.onReject;

  if (nextStepId) {
    // Move to next step
    await moveToNextStep(userId, input.instanceId, nextStepId);

    // Continue workflow execution
    await executeWorkflow(userId, input.instanceId);
  } else {
    // No next step, complete or cancel workflow
    const status = input.approved ? 'completed' : 'cancelled';
    await updateWorkflowInstanceStatus(userId, input.instanceId, status);
  }

  return (await getWorkflowInstanceById(userId, input.instanceId))!;
}

// ────────────────────────────────────────────────────────────────────────────
// Complete Step and Move to Next
// ────────────────────────────────────────────────────────────────────────────

async function completeStep(
  userId: string,
  instanceId: string,
  stepId: string,
  nextStepId?: string
): Promise<void> {
  // Mark step as completed
  await updateStepStatus(userId, instanceId, stepId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  // Move to next step
  if (nextStepId) {
    await moveToNextStep(userId, instanceId, nextStepId);

    // Mark next step as in_progress
    await updateStepStatus(userId, instanceId, nextStepId, {
      status: 'in_progress',
    });

    // Continue workflow execution
    await executeWorkflow(userId, instanceId);
  } else {
    // No next step, complete workflow
    await moveToNextStep(userId, instanceId, null);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Evaluate Template Conditions
// ────────────────────────────────────────────────────────────────────────────

function evaluateTemplateConditions(
  template: WorkflowTemplate,
  referenceData?: Record<string, unknown>
): boolean {
  // For now, always trigger
  // In the future, check template-level conditions
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Evaluate Step Condition
// ────────────────────────────────────────────────────────────────────────────

function evaluateCondition(
  condition: any,
  metadata: Record<string, unknown> | null
): boolean {
  if (!condition || !metadata) {
    return true;
  }

  const fieldValue = metadata[condition.field];
  const expectedValue = condition.value;

  switch (condition.operator) {
    case 'eq':
      return fieldValue === expectedValue;
    case 'neq':
      return fieldValue !== expectedValue;
    case 'gt':
      return (fieldValue as number) > (expectedValue as number);
    case 'gte':
      return (fieldValue as number) >= (expectedValue as number);
    case 'lt':
      return (fieldValue as number) < (expectedValue as number);
    case 'lte':
      return (fieldValue as number) <= (expectedValue as number);
    case 'contains':
      return String(fieldValue).includes(String(expectedValue));
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
    default:
      return true;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Check SLA and Trigger Escalations
// ────────────────────────────────────────────────────────────────────────────

export async function checkSLAAndEscalate(userId: string): Promise<void> {
  // Update overdue status
  await checkOverdueInstances(userId);

  // TODO: Implement escalation logic
  // - Query overdue instances
  // - Check escalation rules from template
  // - Send escalation notifications
  // - Reassign approvals if needed
}
