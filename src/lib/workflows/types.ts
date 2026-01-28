/**
 * UNI-174: Workflow Automation - TypeScript Types
 */

// ────────────────────────────────────────────────────────────────────────────
// Workflow Step Types
// ────────────────────────────────────────────────────────────────────────────

export type WorkflowStepType = 'approval' | 'notification' | 'automation' | 'condition' | 'delay';

export type WorkflowConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value: unknown;
}

export interface WorkflowAction {
  type: 'email' | 'webhook' | 'update_field' | 'create_record';
  template?: string;
  to?: string | string[];
  subject?: string;
  body?: string;
  url?: string;
  payload?: Record<string, unknown>;
}

export interface WorkflowStep {
  stepId: string;
  type: WorkflowStepType;
  name: string;
  assigneeRole?: string;
  assigneeId?: string;
  condition?: WorkflowCondition;
  actions?: WorkflowAction[];
  delayMinutes?: number; // For delay steps
  nextStepId?: string; // For sequential workflows
  onApprove?: string; // Next step ID if approved
  onReject?: string; // Next step ID if rejected
}

// ────────────────────────────────────────────────────────────────────────────
// Workflow Template Types
// ────────────────────────────────────────────────────────────────────────────

export type WorkflowTemplateType = 'approval' | 'notification' | 'automation';

export type WorkflowTriggerEvent =
  | 'invoice.created'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'deal.won'
  | 'deal.lost'
  | 'inventory.low'
  | 'payment.received'
  | 'manual';

export interface EscalationRule {
  afterMinutes: number;
  escalateTo: string; // Role or user ID
  action: WorkflowAction;
}

export interface WorkflowTemplateInput {
  name: string;
  description?: string;
  type: WorkflowTemplateType;
  triggerEvent: WorkflowTriggerEvent;
  steps: WorkflowStep[];
  slaHours?: number;
  escalationRules?: EscalationRule[];
  isActive?: boolean;
}

export interface WorkflowTemplateUpdate {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  slaHours?: number;
  escalationRules?: EscalationRule[];
  isActive?: boolean;
}

export interface WorkflowTemplate {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: WorkflowTemplateType;
  triggerEvent: WorkflowTriggerEvent;
  steps: WorkflowStep[];
  slaHours: number | null;
  escalationRules: EscalationRule[] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Workflow Instance Types
// ────────────────────────────────────────────────────────────────────────────

export type WorkflowInstanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

export type WorkflowStepStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed' | 'failed' | 'skipped';

export interface StepStatusDetail {
  status: WorkflowStepStatus;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStepsStatus {
  [stepId: string]: StepStatusDetail;
}

export interface WorkflowInstanceInput {
  templateId: string;
  referenceType: string;
  referenceId: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowInstance {
  id: string;
  userId: string;
  templateId: string;
  referenceType: string;
  referenceId: string;
  status: WorkflowInstanceStatus;
  currentStepId: string | null;
  stepsStatus: WorkflowStepsStatus;
  slaDeadline: Date | null;
  isOverdue: boolean;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// Workflow Actions
// ────────────────────────────────────────────────────────────────────────────

export interface ApprovalInput {
  instanceId: string;
  stepId: string;
  approved: boolean;
  comment?: string;
  approvedBy: string;
}

export interface WorkflowExecutionContext {
  userId: string;
  instance: WorkflowInstance;
  template: WorkflowTemplate;
  referenceData?: Record<string, unknown>;
}

// ────────────────────────────────────────────────────────────────────────────
// Notification Types
// ────────────────────────────────────────────────────────────────────────────

export type NotificationType = 'email' | 'in_app' | 'sms' | 'webhook';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';

export type NotificationTriggerEvent =
  | 'workflow.approved'
  | 'workflow.rejected'
  | 'workflow.completed'
  | 'workflow.escalated'
  | 'invoice.overdue'
  | 'inventory.low'
  | 'sla.breach';

export interface NotificationInput {
  type: NotificationType;
  channel?: string; // Email address, phone number, webhook URL
  subject: string;
  body: string;
  templateId?: string;
  triggerEvent: NotificationTriggerEvent;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: string | null;
  subject: string;
  body: string;
  templateId: string | null;
  triggerEvent: NotificationTriggerEvent;
  referenceType: string | null;
  referenceId: string | null;
  status: NotificationStatus;
  sentAt: Date | null;
  deliveredAt: Date | null;
  failureReason: string | null;
  retryCount: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  readAt: Date | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Filters & Pagination
// ────────────────────────────────────────────────────────────────────────────

export interface WorkflowTemplateFilter {
  type?: WorkflowTemplateType;
  triggerEvent?: WorkflowTriggerEvent;
  isActive?: boolean;
  search?: string;
}

export interface WorkflowInstanceFilter {
  templateId?: string;
  status?: WorkflowInstanceStatus;
  referenceType?: string;
  referenceId?: string;
  isOverdue?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export interface NotificationFilter {
  type?: NotificationType;
  status?: NotificationStatus;
  triggerEvent?: NotificationTriggerEvent;
  referenceType?: string;
  referenceId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Statistics
// ────────────────────────────────────────────────────────────────────────────

export interface WorkflowStatistics {
  totalTemplates: number;
  activeTemplates: number;
  totalInstances: number;
  pendingInstances: number;
  inProgressInstances: number;
  completedInstances: number;
  overdueInstances: number;
  averageCompletionTimeMinutes: number;
}

export interface NotificationStatistics {
  totalNotifications: number;
  pendingNotifications: number;
  sentNotifications: number;
  failedNotifications: number;
  deliveryRate: number; // Percentage
}
