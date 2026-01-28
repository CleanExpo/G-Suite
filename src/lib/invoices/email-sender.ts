/**
 * UNI-173: Email Sender - Invoice Email Delivery
 *
 * TODO: Install email provider (e.g., resend, nodemailer)
 * npm install resend
 */

import { InvoiceWithRelations, EmailInvoiceParams } from './types';

/**
 * Send invoice via email
 *
 * @param invoice - Invoice to send
 * @param params - Email parameters
 * @returns Promise<void>
 */
export async function sendInvoiceEmail(
  invoice: InvoiceWithRelations,
  params: EmailInvoiceParams
): Promise<void> {
  // TODO: Implement email sending using Resend or similar service
  // This is a placeholder implementation
  throw new Error('Email sending not yet implemented. Install an email provider first.');
}

/**
 * Send payment receipt via email
 *
 * @param invoice - Invoice that was paid
 * @param recipientEmail - Recipient email address
 * @returns Promise<void>
 */
export async function sendPaymentReceiptEmail(
  invoice: InvoiceWithRelations,
  recipientEmail: string
): Promise<void> {
  // TODO: Implement payment receipt email
  throw new Error('Payment receipt email not yet implemented.');
}

/**
 * Send overdue invoice reminder
 *
 * @param invoice - Overdue invoice
 * @param recipientEmail - Recipient email address
 * @returns Promise<void>
 */
export async function sendOverdueReminderEmail(
  invoice: InvoiceWithRelations,
  recipientEmail: string
): Promise<void> {
  // TODO: Implement overdue reminder email
  throw new Error('Overdue reminder email not yet implemented.');
}
