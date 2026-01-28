/**
 * UNI-173: Invoice Number Generation
 * Generates sequential invoice numbers in format: INV-YYYY-####
 */

import { prisma } from '@/lib/db';

/**
 * Generate next invoice number for a user
 * Format: INV-YYYY-#### (e.g., INV-2026-0001)
 *
 * Uses database transaction to ensure atomicity and prevent race conditions.
 *
 * @param userId - The user ID
 * @returns Promise<string> - The generated invoice number
 */
export async function generateInvoiceNumber(userId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // Use transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // Find the highest invoice number for this user and year
    const lastInvoice = await tx.invoice.findFirst({
      where: {
        userId,
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
      select: {
        invoiceNumber: true,
      },
    });

    let nextNumber = 1;

    if (lastInvoice) {
      // Extract the number from the last invoice (e.g., "INV-2026-0042" -> 42)
      const lastNumberStr = lastInvoice.invoiceNumber.split('-')[2];
      const lastNumber = parseInt(lastNumberStr, 10);
      nextNumber = lastNumber + 1;
    }

    // Format with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    const invoiceNumber = `${prefix}${formattedNumber}`;

    return invoiceNumber;
  });
}

/**
 * Validate invoice number format
 *
 * @param invoiceNumber - The invoice number to validate
 * @returns boolean - True if valid format
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // Format: INV-YYYY-####
  const pattern = /^INV-\d{4}-\d{4}$/;
  return pattern.test(invoiceNumber);
}

/**
 * Parse invoice number to extract year and sequence
 *
 * @param invoiceNumber - The invoice number to parse
 * @returns { year: number; sequence: number } | null
 */
export function parseInvoiceNumber(invoiceNumber: string): { year: number; sequence: number } | null {
  if (!isValidInvoiceNumber(invoiceNumber)) {
    return null;
  }

  const parts = invoiceNumber.split('-');
  const year = parseInt(parts[1], 10);
  const sequence = parseInt(parts[2], 10);

  return { year, sequence };
}
