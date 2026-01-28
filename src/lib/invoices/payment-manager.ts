/**
 * UNI-173: Payment Manager - Payment Processing
 */

import { prisma } from '@/lib/db';
import {
  PaymentInput,
  PaymentResponse,
  PaymentFilter,
  PaginatedResponse,
} from './types';

// ─── Record Payment ─────────────────────────────────────────────────────────

/**
 * Record a payment for an invoice
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @param data - Payment data
 * @returns Promise<PaymentResponse>
 */
export async function recordPayment(
  userId: string,
  invoiceId: string,
  data: PaymentInput
): Promise<PaymentResponse> {
  // Get invoice to verify ownership and calculate new balance
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Validate payment amount
  if (data.amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  if (data.amount > invoice.balance) {
    throw new Error('Payment amount exceeds invoice balance');
  }

  // Create payment and update invoice in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create payment
    const payment = await tx.payment.create({
      data: {
        userId,
        invoiceId,
        amount: data.amount,
        paymentDate: data.paymentDate || new Date(),
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
        customFields: data.customFields || {},
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Update invoice paid amount and balance
    const newPaidAmount = invoice.paidAmount + data.amount;
    const newBalance = invoice.total - newPaidAmount;

    // Determine new status
    let newStatus = invoice.status;
    let paidAt = invoice.paidAt;

    if (newBalance === 0) {
      newStatus = 'paid';
      paidAt = new Date();
    } else if (newBalance > 0 && invoice.status === 'draft') {
      newStatus = 'sent'; // Partial payment moves from draft to sent
    }

    // Update invoice
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        paidAt,
        updatedBy: userId,
      },
    });

    return payment;
  });

  return result as PaymentResponse;
}

// ─── Get Payment ────────────────────────────────────────────────────────────

/**
 * Get payment by ID
 *
 * @param userId - The user ID (for ownership verification)
 * @param paymentId - Payment ID
 * @returns Promise<PaymentResponse | null>
 */
export async function getPaymentById(
  userId: string,
  paymentId: string
): Promise<PaymentResponse | null> {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId, deletedAt: null },
  });

  return payment as any;
}

// ─── List Payments ──────────────────────────────────────────────────────────

/**
 * List payments with filters and pagination
 *
 * @param userId - The user ID
 * @param filters - Filter criteria
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Promise<PaginatedResponse<PaymentResponse>>
 */
export async function listPayments(
  userId: string,
  filters: PaymentFilter = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<PaymentResponse>> {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    userId,
    deletedAt: null,
  };

  // Invoice filter
  if (filters.invoiceId) {
    where.invoiceId = filters.invoiceId;
  }

  // Payment method filter
  if (filters.paymentMethod) {
    where.paymentMethod = filters.paymentMethod;
  }

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.paymentDate = {};
    if (filters.startDate) {
      where.paymentDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.paymentDate.lte = filters.endDate;
    }
  }

  // Amount range filter
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {};
    if (filters.minAmount !== undefined) {
      where.amount.gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      where.amount.lte = filters.maxAmount;
    }
  }

  // Execute query with pagination
  const [payments, totalItems] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        paymentDate: 'desc',
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: payments as any[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

// ─── Get Payments for Invoice ───────────────────────────────────────────────

/**
 * Get all payments for a specific invoice
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @returns Promise<PaymentResponse[]>
 */
export async function getPaymentsByInvoice(
  userId: string,
  invoiceId: string
): Promise<PaymentResponse[]> {
  // Verify invoice ownership
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const payments = await prisma.payment.findMany({
    where: {
      invoiceId,
      deletedAt: null,
    },
    orderBy: {
      paymentDate: 'desc',
    },
  });

  return payments as any[];
}

// ─── Update Payment ─────────────────────────────────────────────────────────

/**
 * Update payment details (notes, reference number, etc.)
 * Note: Amount changes require refund/new payment
 *
 * @param userId - The user ID (for ownership verification)
 * @param paymentId - Payment ID
 * @param data - Updated payment data
 * @returns Promise<PaymentResponse>
 */
export async function updatePayment(
  userId: string,
  paymentId: string,
  data: {
    referenceNumber?: string;
    notes?: string;
    customFields?: Record<string, any>;
  }
): Promise<PaymentResponse> {
  // Verify payment ownership
  const existing = await prisma.payment.findFirst({
    where: { id: paymentId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Payment not found');
  }

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      customFields: data.customFields,
      updatedBy: userId,
    },
  });

  return payment as any;
}

// ─── Refund Payment ─────────────────────────────────────────────────────────

/**
 * Process a refund for a payment
 *
 * @param userId - The user ID
 * @param paymentId - Payment ID to refund
 * @param refundAmount - Amount to refund (in cents), defaults to full amount
 * @param notes - Refund notes
 * @returns Promise<PaymentResponse>
 */
export async function refundPayment(
  userId: string,
  paymentId: string,
  refundAmount?: number,
  notes?: string
): Promise<PaymentResponse> {
  // Get payment with invoice
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId, deletedAt: null },
    include: {
      invoice: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status === 'refunded') {
    throw new Error('Payment already refunded');
  }

  // Default to full refund
  const amountToRefund = refundAmount !== undefined ? refundAmount : payment.amount;

  if (amountToRefund <= 0 || amountToRefund > payment.amount) {
    throw new Error('Invalid refund amount');
  }

  // Process refund and update invoice in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
        notes: notes || payment.notes,
        updatedBy: userId,
      },
    });

    // Update invoice
    const newPaidAmount = payment.invoice.paidAmount - amountToRefund;
    const newBalance = payment.invoice.total - newPaidAmount;

    let newStatus = payment.invoice.status;
    if (newPaidAmount === 0) {
      newStatus = 'sent'; // No payments, back to sent/unpaid
    } else if (newPaidAmount < payment.invoice.total && payment.invoice.status === 'paid') {
      // Was fully paid, now partially paid
      const now = new Date();
      const overdue = payment.invoice.dueDate < now;
      newStatus = overdue ? 'overdue' : 'sent';
    }

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        paidAt: newPaidAmount === payment.invoice.total ? payment.invoice.paidAt : null,
        updatedBy: userId,
      },
    });

    return updatedPayment;
  });

  return result as any;
}

// ─── Delete Payment (Soft Delete) ───────────────────────────────────────────

/**
 * Soft delete payment (reverses the payment from invoice)
 *
 * @param userId - The user ID (for ownership verification)
 * @param paymentId - Payment ID
 * @returns Promise<void>
 */
export async function deletePayment(userId: string, paymentId: string): Promise<void> {
  // Get payment with invoice
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId, deletedAt: null },
    include: {
      invoice: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Delete payment and update invoice in transaction
  await prisma.$transaction(async (tx) => {
    // Soft delete payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Reverse payment from invoice
    const newPaidAmount = payment.invoice.paidAmount - payment.amount;
    const newBalance = payment.invoice.total - newPaidAmount;

    let newStatus = payment.invoice.status;
    if (newPaidAmount === 0) {
      newStatus = 'sent';
    } else if (newPaidAmount < payment.invoice.total && payment.invoice.status === 'paid') {
      const now = new Date();
      const overdue = payment.invoice.dueDate < now;
      newStatus = overdue ? 'overdue' : 'sent';
    }

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        paidAt: newPaidAmount === payment.invoice.total ? payment.invoice.paidAt : null,
        updatedBy: userId,
      },
    });
  });
}

// ─── Payment Statistics ─────────────────────────────────────────────────────

/**
 * Get payment statistics for a user
 *
 * @param userId - The user ID
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Promise<PaymentStats>
 */
export async function getPaymentStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalPayments: number;
  totalAmount: number;
  completedCount: number;
  completedAmount: number;
  refundedCount: number;
  refundedAmount: number;
  byMethod: Record<string, { count: number; amount: number }>;
}> {
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (startDate || endDate) {
    where.paymentDate = {};
    if (startDate) where.paymentDate.gte = startDate;
    if (endDate) where.paymentDate.lte = endDate;
  }

  const payments = await prisma.payment.findMany({
    where,
    select: {
      amount: true,
      status: true,
      paymentMethod: true,
    },
  });

  const stats = {
    totalPayments: payments.length,
    totalAmount: 0,
    completedCount: 0,
    completedAmount: 0,
    refundedCount: 0,
    refundedAmount: 0,
    byMethod: {} as Record<string, { count: number; amount: number }>,
  };

  for (const payment of payments) {
    stats.totalAmount += payment.amount;

    if (payment.status === 'completed') {
      stats.completedCount++;
      stats.completedAmount += payment.amount;
    } else if (payment.status === 'refunded') {
      stats.refundedCount++;
      stats.refundedAmount += payment.amount;
    }

    // Group by method
    if (!stats.byMethod[payment.paymentMethod]) {
      stats.byMethod[payment.paymentMethod] = { count: 0, amount: 0 };
    }
    stats.byMethod[payment.paymentMethod].count++;
    stats.byMethod[payment.paymentMethod].amount += payment.amount;
  }

  return stats;
}
