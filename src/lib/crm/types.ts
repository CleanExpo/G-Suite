/**
 * UNI-171: CRM Type Definitions
 *
 * TypeScript interfaces for CRM entities
 */

// ─── Contact Types ─────────────────────────────────────────────────────

export interface ContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  companyId?: string;
  isPrimary?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  leadScore?: number;
  status?: string;
  tags?: string[];
  dealId?: string;
  customFields?: Record<string, any>;
}

export interface ContactFilter {
  status?: string;
  companyId?: string;
  search?: string;
  tags?: string[];
  leadScore?: number;
}

export interface ContactUpdate extends Partial<ContactInput> {}

// ─── Company Types ─────────────────────────────────────────────────────

export interface CompanyInput {
  name: string;
  legalName?: string;
  industry?: string;
  website?: string;
  employeeCount?: string;
  annualRevenue?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  status?: string;
  parentCompanyId?: string;
  customFields?: Record<string, any>;
}

export interface CompanyFilter {
  status?: string;
  industry?: string;
  search?: string;
  parentCompanyId?: string;
}

export interface CompanyUpdate extends Partial<CompanyInput> {}

// ─── Deal Types ────────────────────────────────────────────────────────

export interface DealInput {
  name: string;
  description?: string;
  value: number; // In cents
  currency?: string;
  stage: string;
  probability?: number;
  expectedCloseDate?: Date | string;
  actualCloseDate?: Date | string;
  companyId?: string;
  ownerId: string;
  source?: string;
  lostReason?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface DealFilter {
  stage?: string;
  ownerId?: string;
  companyId?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
}

export interface DealUpdate extends Partial<DealInput> {}

// ─── Interaction Types ─────────────────────────────────────────────────

export interface InteractionInput {
  type: string; // call, email, meeting, note
  subject: string;
  description?: string;
  outcome?: string;
  scheduledAt?: Date | string;
  completedAt?: Date | string;
  duration?: number;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  participants?: string[];
  status?: string;
  direction?: string;
  attachments?: Record<string, any>;
}

export interface InteractionFilter {
  type?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface InteractionUpdate extends Partial<InteractionInput> {}

// ─── Task Types ────────────────────────────────────────────────────────

export interface TaskInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: Date | string;
  completedAt?: Date | string;
  reminderAt?: Date | string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  assigneeId: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface TaskFilter {
  status?: string;
  priority?: string;
  assigneeId?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  overdue?: boolean;
}

export interface TaskUpdate extends Partial<TaskInput> {}

// ─── Pagination ────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
