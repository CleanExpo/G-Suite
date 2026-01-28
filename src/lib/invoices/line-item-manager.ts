/**
 * UNI-173: Line Item Manager - Line Item Operations
 */

import { prisma } from '@/lib/db';
import { LineItemInput, LineItemUpdateInput, LineItemWithProduct } from './types';
import { recalculateInvoiceTotals } from './invoice-manager';

// ─── Add Line Item ──────────────────────────────────────────────────────────

/**
 * Add a line item to an invoice
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @param data - Line item data
 * @returns Promise<LineItemWithProduct>
 */
export async function addLineItem(
  userId: string,
  invoiceId: string,
  data: LineItemInput
): Promise<LineItemWithProduct> {
  // Verify invoice ownership
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

  // Calculate amounts
  const amount = data.quantity * data.unitPrice;
  const taxAmount = data.taxable !== false
    ? Math.round(amount * (data.taxRate || invoice.taxRate))
    : 0;

  // Determine sort order (append to end if not specified)
  const sortOrder = data.sortOrder !== undefined
    ? data.sortOrder
    : invoice.lineItems.length;

  // Create line item
  const lineItem = await prisma.invoiceLineItem.create({
    data: {
      userId,
      invoiceId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      amount,
      productId: data.productId,
      taxable: data.taxable !== false,
      taxRate: data.taxRate || invoice.taxRate,
      taxAmount,
      sortOrder,
      customFields: data.customFields || {},
    },
    include: {
      product: true,
    },
  });

  // Recalculate invoice totals
  await recalculateInvoiceTotals(userId, invoiceId);

  return lineItem as any;
}

// ─── Update Line Item ───────────────────────────────────────────────────────

/**
 * Update a line item
 *
 * @param userId - The user ID (for ownership verification)
 * @param lineItemId - Line item ID
 * @param data - Updated line item data
 * @returns Promise<LineItemWithProduct>
 */
export async function updateLineItem(
  userId: string,
  lineItemId: string,
  data: LineItemUpdateInput
): Promise<LineItemWithProduct> {
  // Get existing line item with invoice
  const existing = await prisma.invoiceLineItem.findFirst({
    where: { id: lineItemId, userId, deletedAt: null },
    include: {
      invoice: true,
    },
  });

  if (!existing) {
    throw new Error('Line item not found');
  }

  // Calculate new amounts if quantity or price changed
  const quantity = data.quantity !== undefined ? data.quantity : existing.quantity;
  const unitPrice = data.unitPrice !== undefined ? data.unitPrice : existing.unitPrice;
  const amount = quantity * unitPrice;

  const taxable = data.taxable !== undefined ? data.taxable : existing.taxable;
  const taxRate = data.taxRate !== undefined ? data.taxRate : existing.taxRate;
  const taxAmount = taxable ? Math.round(amount * taxRate) : 0;

  // Update line item
  const lineItem = await prisma.invoiceLineItem.update({
    where: { id: lineItemId },
    data: {
      description: data.description,
      quantity,
      unitPrice,
      amount,
      taxable,
      taxRate,
      taxAmount,
      sortOrder: data.sortOrder,
      customFields: data.customFields,
    },
    include: {
      product: true,
    },
  });

  // Recalculate invoice totals
  await recalculateInvoiceTotals(userId, existing.invoiceId);

  return lineItem as any;
}

// ─── Delete Line Item (Soft Delete) ─────────────────────────────────────────

/**
 * Soft delete a line item
 *
 * @param userId - The user ID (for ownership verification)
 * @param lineItemId - Line item ID
 * @returns Promise<void>
 */
export async function deleteLineItem(userId: string, lineItemId: string): Promise<void> {
  // Get existing line item
  const existing = await prisma.invoiceLineItem.findFirst({
    where: { id: lineItemId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Line item not found');
  }

  // Soft delete
  await prisma.invoiceLineItem.update({
    where: { id: lineItemId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Recalculate invoice totals
  await recalculateInvoiceTotals(userId, existing.invoiceId);
}

// ─── Get Line Item ──────────────────────────────────────────────────────────

/**
 * Get a single line item by ID
 *
 * @param userId - The user ID (for ownership verification)
 * @param lineItemId - Line item ID
 * @returns Promise<LineItemWithProduct | null>
 */
export async function getLineItem(
  userId: string,
  lineItemId: string
): Promise<LineItemWithProduct | null> {
  const lineItem = await prisma.invoiceLineItem.findFirst({
    where: { id: lineItemId, userId, deletedAt: null },
    include: {
      product: true,
    },
  });

  return lineItem as any;
}

// ─── List Line Items for Invoice ────────────────────────────────────────────

/**
 * Get all line items for an invoice
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @returns Promise<LineItemWithProduct[]>
 */
export async function getLineItemsByInvoice(
  userId: string,
  invoiceId: string
): Promise<LineItemWithProduct[]> {
  // Verify invoice ownership
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      invoiceId,
      deletedAt: null,
    },
    include: {
      product: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return lineItems as any[];
}

// ─── Reorder Line Items ─────────────────────────────────────────────────────

/**
 * Reorder line items by updating their sort order
 *
 * @param userId - The user ID (for ownership verification)
 * @param invoiceId - Invoice ID
 * @param lineItemIds - Array of line item IDs in desired order
 * @returns Promise<void>
 */
export async function reorderLineItems(
  userId: string,
  invoiceId: string,
  lineItemIds: string[]
): Promise<void> {
  // Verify invoice ownership
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId, deletedAt: null },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Update sort order for each line item
  await prisma.$transaction(
    lineItemIds.map((id, index) =>
      prisma.invoiceLineItem.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
}
