/**
 * UNI-173: Invoice Manager - CRUD Operations
 */

import { prisma } from '@/lib/db';
import {
  InvoiceInput,
  InvoiceUpdateInput,
  InvoiceFilter,
  InvoiceWithRelations,
  PaginatedResponse,
  InvoiceTotals,
  InvoiceStats,
} from './types';
import { generateInvoiceNumber } from './invoice-number';

// ─── Create Invoice ─────────────────────────────────────────────────────────

/**
 * Create a new invoice with line items
 *
 * @param userId - The user creating the invoice
 * @param data - Invoice data including line items
 * @returns Promise<InvoiceWithRelations> - Created invoice with relations
 */
export async function createInvoice(
  userId: string,
  data: InvoiceInput
): Promise<InvoiceWithRelations> {
  // Generate sequential invoice number
  const invoiceNumber = await generateInvoiceNumber(userId);

  // Calculate totals
  const totals = calculateInvoiceTotals(
    data.lineItems,
    data.taxRate || 0,
    data.discountAmount || 0
  );

  // Create invoice with line items in transaction
  const invoice = await prisma.invoice.create({
    data: {
      userId,
      invoiceNumber,
      invoiceDate: data.invoiceDate || new Date(),
      dueDate: data.dueDate,

      // Customer info
      customerId: data.customerId,
      companyId: data.companyId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerAddress: (data.customerAddress || {}) as any,

      // Billing
      subtotal: totals.subtotal,
      taxRate: data.taxRate || 0,
      taxAmount: totals.taxAmount,
      discountAmount: data.discountAmount || 0,
      total: totals.total,
      balance: totals.total, // Initially, balance = total
      currency: data.currency || 'USD',

      // Metadata
      notes: data.notes,
      terms: data.terms,
      footer: data.footer,
      customFields: data.customFields || {},

      // Audit
      createdBy: userId,
      updatedBy: userId,

      // Line items
      lineItems: {
        create: data.lineItems.map((item, index) => {
          const amount = item.quantity * item.unitPrice;
          const itemTaxAmount = item.taxable !== false
            ? Math.round(amount * (item.taxRate || data.taxRate || 0))
            : 0;

          return {
            userId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount,
            productId: item.productId,
            taxable: item.taxable !== false,
            taxRate: item.taxRate || data.taxRate || 0,
            taxAmount: itemTaxAmount,
            sortOrder: item.sortOrder !== undefined ? item.sortOrder : index,
            customFields: item.customFields || {},
          };
        }),
      },
    },
    include: {
      lineItems: {
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: true,
      customer: true,
      company: true,
    },
  });

  return invoice as any;
}

// ─── Read Invoice ───────────────────────────────────────────────────────────

/**
 * Get invoice by ID
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @returns Promise<InvoiceWithRelations | null>
 */
export async function getInvoiceById(
  userId: string,
  invoiceId: string
): Promise<InvoiceWithRelations | null> {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
      deletedAt: null,
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
  });

  return invoice as any;
}

/**
 * Get invoice by invoice number
 *
 * @param userId - The user ID
 * @param invoiceNumber - Invoice number (e.g., "INV-2026-0001")
 * @returns Promise<InvoiceWithRelations | null>
 */
export async function getInvoiceByNumber(
  userId: string,
  invoiceNumber: string
): Promise<InvoiceWithRelations | null> {
  const invoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber,
      userId,
      deletedAt: null,
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
  });

  return invoice as any;
}

// ─── Update Invoice ─────────────────────────────────────────────────────────

/**
 * Update invoice
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @param data - Updated invoice data
 * @returns Promise<InvoiceWithRelations>
 */
export async function updateInvoice(
  userId: string,
  invoiceId: string,
  data: InvoiceUpdateInput
): Promise<InvoiceWithRelations> {
  // Verify ownership
  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Invoice not found');
  }

  // Update invoice
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerAddress: data.customerAddress as any,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      taxRate: data.taxRate,
      discountAmount: data.discountAmount,
      notes: data.notes,
      terms: data.terms,
      footer: data.footer,
      customFields: data.customFields,
      status: data.status,
      updatedBy: userId,
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
  });

  return invoice as any;
}

// ─── Delete Invoice (Soft Delete) ───────────────────────────────────────────

/**
 * Soft delete invoice
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @returns Promise<void>
 */
export async function deleteInvoice(userId: string, invoiceId: string): Promise<void> {
  // Verify ownership
  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Invoice not found');
  }

  // Soft delete
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      deletedAt: new Date(),
    },
  });
}

// ─── List Invoices ──────────────────────────────────────────────────────────

/**
 * List invoices with filters and pagination
 *
 * @param userId - The user ID
 * @param filters - Filter criteria
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Promise<PaginatedResponse<InvoiceWithRelations>>
 */
export async function listInvoices(
  userId: string,
  filters: InvoiceFilter = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<InvoiceWithRelations>> {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    userId,
    deletedAt: null,
  };

  // Status filter
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      where.status = { in: filters.status };
    } else {
      where.status = filters.status;
    }
  }

  // Customer/Company filter
  if (filters.customerId) {
    where.customerId = filters.customerId;
  }
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.invoiceDate = {};
    if (filters.startDate) {
      where.invoiceDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.invoiceDate.lte = filters.endDate;
    }
  }

  // Amount range filter
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.total = {};
    if (filters.minAmount !== undefined) {
      where.total.gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      where.total.lte = filters.maxAmount;
    }
  }

  // Search filter (invoice number, customer name, email)
  if (filters.searchTerm) {
    where.OR = [
      { invoiceNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
      { customerName: { contains: filters.searchTerm, mode: 'insensitive' } },
      { customerEmail: { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  // Execute query with pagination
  const [invoices, totalItems] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        lineItems: {
          where: { deletedAt: null },
          include: {
            product: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: {
            paymentDate: 'desc',
          },
        },
        customer: true,
        company: true,
      },
      orderBy: {
        invoiceDate: 'desc',
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: invoices as any[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

// ─── Invoice Statistics ─────────────────────────────────────────────────────

/**
 * Get invoice statistics for a user
 *
 * @param userId - The user ID
 * @returns Promise<InvoiceStats>
 */
export async function getInvoiceStats(userId: string): Promise<InvoiceStats> {
  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    select: {
      status: true,
      total: true,
      paidAmount: true,
      createdAt: true,
      paidAt: true,
    },
  });

  const stats: InvoiceStats = {
    totalInvoices: invoices.length,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    draftCount: 0,
    sentCount: 0,
    paidCount: 0,
    overdueCount: 0,
    cancelledCount: 0,
    averageInvoiceValue: 0,
    averagePaymentTime: 0,
  };

  let totalPaymentDays = 0;
  let paidInvoicesWithDates = 0;

  for (const invoice of invoices) {
    stats.totalRevenue += invoice.total;
    stats.totalPaid += invoice.paidAmount;

    // Count by status
    if (invoice.status === 'draft') stats.draftCount++;
    else if (invoice.status === 'sent') stats.sentCount++;
    else if (invoice.status === 'paid') stats.paidCount++;
    else if (invoice.status === 'overdue') stats.overdueCount++;
    else if (invoice.status === 'cancelled') stats.cancelledCount++;

    // Pending/overdue amounts
    if (invoice.status === 'sent' || invoice.status === 'overdue') {
      const pending = invoice.total - invoice.paidAmount;
      if (invoice.status === 'sent') {
        stats.totalPending += pending;
      } else {
        stats.totalOverdue += pending;
      }
    }

    // Calculate average payment time
    if (invoice.paidAt && invoice.createdAt) {
      const daysDiff = Math.floor(
        (invoice.paidAt.getTime() - invoice.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalPaymentDays += daysDiff;
      paidInvoicesWithDates++;
    }
  }

  stats.averageInvoiceValue = invoices.length > 0
    ? Math.round(stats.totalRevenue / invoices.length)
    : 0;

  stats.averagePaymentTime = paidInvoicesWithDates > 0
    ? Math.round(totalPaymentDays / paidInvoicesWithDates)
    : 0;

  return stats;
}

// ─── Calculate Totals ───────────────────────────────────────────────────────

/**
 * Calculate invoice totals from line items
 *
 * @param lineItems - Array of line items
 * @param taxRate - Tax rate (e.g., 0.08 for 8%)
 * @param discountAmount - Discount in cents
 * @returns InvoiceTotals
 */
export function calculateInvoiceTotals(
  lineItems: Array<{ quantity: number; unitPrice: number; taxable?: boolean; taxRate?: number }>,
  taxRate: number = 0,
  discountAmount: number = 0
): InvoiceTotals {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  // Calculate tax on taxable items
  let taxAmount = 0;
  for (const item of lineItems) {
    if (item.taxable !== false) {
      const itemAmount = item.quantity * item.unitPrice;
      const itemTaxRate = item.taxRate !== undefined ? item.taxRate : taxRate;
      taxAmount += Math.round(itemAmount * itemTaxRate);
    }
  }

  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total: Math.max(0, total), // Ensure total is not negative
  };
}

// ─── Recalculate Invoice Totals ─────────────────────────────────────────────

/**
 * Recalculate and update invoice totals based on current line items
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @returns Promise<InvoiceWithRelations>
 */
export async function recalculateInvoiceTotals(
  userId: string,
  invoiceId: string
): Promise<InvoiceWithRelations> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
    include: {
      lineItems: {
        where: { deletedAt: null },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Calculate new totals
  const totals = calculateInvoiceTotals(
    invoice.lineItems,
    invoice.taxRate,
    invoice.discountAmount
  );

  // Update invoice
  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      balance: totals.total - invoice.paidAmount,
      updatedBy: userId,
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
  });

  return updated as any;
}

// ─── Mark Invoice as Sent ───────────────────────────────────────────────────

/**
 * Mark invoice as sent
 *
 * @param userId - The user ID
 * @param invoiceId - Invoice ID
 * @returns Promise<InvoiceWithRelations>
 */
export async function markInvoiceAsSent(
  userId: string,
  invoiceId: string
): Promise<InvoiceWithRelations> {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'sent',
      sentAt: new Date(),
      updatedBy: userId,
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
  });

  return invoice as any;
}

// ─── Void Invoice ───────────────────────────────────────────────────────────

/**
 * Void/cancel invoice
 *
 * @param userId - The user ID
 * @param invoiceId - Invoice ID
 * @returns Promise<InvoiceWithRelations>
 */
export async function voidInvoice(
  userId: string,
  invoiceId: string
): Promise<InvoiceWithRelations> {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'cancelled',
      updatedBy: userId,
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
  });

  return invoice as any;
}

// ─── Get Overdue Invoices ───────────────────────────────────────────────────

/**
 * Get overdue invoices (past due date and not paid)
 *
 * @param userId - The user ID
 * @returns Promise<InvoiceWithRelations[]>
 */
export async function getOverdueInvoices(userId: string): Promise<InvoiceWithRelations[]> {
  const now = new Date();

  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      deletedAt: null,
      status: {
        in: ['sent', 'overdue'],
      },
      dueDate: {
        lt: now,
      },
      balance: {
        gt: 0,
      },
    },
    include: {
      lineItems: {
        where: { deletedAt: null },
        include: {
          product: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      payments: {
        where: { deletedAt: null },
        orderBy: {
          paymentDate: 'desc',
        },
      },
      customer: true,
      company: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  return invoices as any[];
}
