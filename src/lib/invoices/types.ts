/**
 * UNI-173: Invoicing & Financial Module - TypeScript Types
 */

// ─── Invoice Types ──────────────────────────────────────────────────────────

export interface InvoiceInput {
  // Customer Information
  customerId?: string;
  companyId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: CustomerAddress;

  // Invoice Details
  invoiceDate?: Date;
  dueDate: Date;

  // Billing
  taxRate?: number;
  discountAmount?: number;
  currency?: string;

  // Metadata
  notes?: string;
  terms?: string;
  footer?: string;
  customFields?: Record<string, any>;

  // Line Items
  lineItems: LineItemInput[];
}

export interface InvoiceUpdateInput {
  // Customer Information
  customerName?: string;
  customerEmail?: string;
  customerAddress?: CustomerAddress;

  // Invoice Details
  invoiceDate?: Date;
  dueDate?: Date;

  // Billing
  taxRate?: number;
  discountAmount?: number;

  // Metadata
  notes?: string;
  terms?: string;
  footer?: string;
  customFields?: Record<string, any>;
  status?: InvoiceStatus;
}

export interface CustomerAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded';

// ─── Line Item Types ────────────────────────────────────────────────────────

export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number; // In cents
  productId?: string;
  taxable?: boolean;
  taxRate?: number;
  sortOrder?: number;
  customFields?: Record<string, any>;
}

export interface LineItemUpdateInput {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxable?: boolean;
  taxRate?: number;
  sortOrder?: number;
  customFields?: Record<string, any>;
}

// ─── Payment Types ──────────────────────────────────────────────────────────

export interface PaymentInput {
  amount: number; // In cents
  paymentDate?: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  customFields?: Record<string, any>;
}

export type PaymentMethod =
  | 'stripe'
  | 'bank_transfer'
  | 'cash'
  | 'check'
  | 'credit_card';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// ─── Filter Types ───────────────────────────────────────────────────────────

export interface InvoiceFilter {
  status?: InvoiceStatus | InvoiceStatus[];
  customerId?: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number; // In cents
  maxAmount?: number; // In cents
  searchTerm?: string; // Search in invoice number, customer name, email
}

export interface PaymentFilter {
  invoiceId?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// ─── Response Types ─────────────────────────────────────────────────────────

export interface InvoiceWithRelations {
  id: string;
  userId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;

  // Customer
  customerId?: string;
  companyId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: CustomerAddress;

  // Billing
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;

  // Payment Tracking
  status: InvoiceStatus;
  paidAmount: number;
  balance: number;

  // Stripe
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;

  // Metadata
  notes?: string;
  terms?: string;
  footer?: string;
  customFields?: Record<string, any>;

  // Relations
  lineItems: LineItemWithProduct[];
  payments: PaymentResponse[];
  customer?: ContactResponse;
  company?: CompanyResponse;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  sentAt?: Date;
  paidAt?: Date;
}

export interface LineItemWithProduct {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
  taxRate: number;
  taxAmount: number;
  sortOrder: number;
  productId?: string;
  product?: ProductResponse;
  customFields?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeRefundId?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface ContactResponse {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: CompanyResponse;
}

export interface CompanyResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description?: string;
  sellingPrice: number;
}

// ─── Statistics Types ───────────────────────────────────────────────────────

export interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number; // In cents
  totalPaid: number; // In cents
  totalPending: number; // In cents
  totalOverdue: number; // In cents

  // Breakdown by status
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;

  // Average values
  averageInvoiceValue: number;
  averagePaymentTime: number; // In days
}

// ─── Pagination Types ───────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ─── Calculation Types ──────────────────────────────────────────────────────

export interface InvoiceTotals {
  subtotal: number; // Sum of all line items
  taxAmount: number; // Calculated tax
  discountAmount: number; // Discount applied
  total: number; // Subtotal + tax - discount
}

// ─── Email Types ────────────────────────────────────────────────────────────

export interface EmailInvoiceParams {
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
  message?: string;
  attachPdf?: boolean;
  includePaymentLink?: boolean;
}

// ─── Stripe Integration Types ───────────────────────────────────────────────

export interface StripePaymentIntentParams {
  amount: number; // In cents
  currency?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface StripeCustomerParams {
  email: string;
  name: string;
  phone?: string;
  address?: CustomerAddress;
  metadata?: Record<string, string>;
}
