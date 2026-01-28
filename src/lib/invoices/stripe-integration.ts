/**
 * UNI-173: Stripe Integration for Invoice Payments
 */

import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { StripePaymentIntentParams, StripeCustomerParams } from './types';
import Stripe from 'stripe';

// ─── Create or Get Stripe Customer ─────────────────────────────────────────

/**
 * Create or retrieve a Stripe customer for an invoice
 *
 * @param invoiceId - Invoice ID
 * @param params - Customer parameters
 * @returns Promise<string> - Stripe customer ID
 */
export async function getOrCreateStripeCustomer(
  invoiceId: string,
  params: StripeCustomerParams
): Promise<string> {
  // Check if invoice already has a Stripe customer
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { stripeCustomerId: true },
  });

  if (invoice?.stripeCustomerId) {
    return invoice.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
    address: params.address
      ? {
          line1: params.address.line1,
          line2: params.address.line2,
          city: params.address.city,
          state: params.address.state,
          postal_code: params.address.postalCode,
          country: params.address.country,
        }
      : undefined,
    metadata: {
      invoiceId,
      ...(params.metadata || {}),
    },
  });

  // Update invoice with Stripe customer ID
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── Create Payment Intent ──────────────────────────────────────────────────

/**
 * Create a Stripe Payment Intent for an invoice
 *
 * @param userId - User ID
 * @param invoiceId - Invoice ID
 * @param params - Payment intent parameters
 * @returns Promise<Stripe.PaymentIntent>
 */
export async function createPaymentIntent(
  userId: string,
  invoiceId: string,
  params?: Partial<StripePaymentIntentParams>
): Promise<Stripe.PaymentIntent> {
  // Get invoice
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: {
      customer: true,
      company: true,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.balance <= 0) {
    throw new Error('Invoice is already paid');
  }

  // Get or create Stripe customer if email is available
  let customerId: string | undefined;
  if (params?.customerEmail || invoice.customerEmail) {
    customerId = await getOrCreateStripeCustomer(invoiceId, {
      email: params?.customerEmail || invoice.customerEmail!,
      name: invoice.customerName,
      phone: invoice.customer?.phone || undefined,
      address: invoice.customerAddress as any,
    });
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params?.amount || invoice.balance,
    currency: (params?.currency || invoice.currency || 'USD').toLowerCase(),
    customer: customerId,
    description: params?.description || `Payment for Invoice ${invoice.invoiceNumber}`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      userId,
      ...(params?.metadata || {}),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Update invoice with payment intent ID
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return paymentIntent;
}

// ─── Confirm Payment Intent ─────────────────────────────────────────────────

/**
 * Confirm a payment intent (for server-side confirmation)
 *
 * @param paymentIntentId - Stripe Payment Intent ID
 * @param paymentMethodId - Stripe Payment Method ID
 * @returns Promise<Stripe.PaymentIntent>
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}

// ─── Get Payment Intent ─────────────────────────────────────────────────────

/**
 * Retrieve a payment intent by ID
 *
 * @param paymentIntentId - Stripe Payment Intent ID
 * @returns Promise<Stripe.PaymentIntent>
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

// ─── Create Refund ──────────────────────────────────────────────────────────

/**
 * Create a refund for a charge
 *
 * @param chargeId - Stripe Charge ID
 * @param amount - Amount to refund (optional, defaults to full amount)
 * @param reason - Refund reason
 * @returns Promise<Stripe.Refund>
 */
export async function createRefund(
  chargeId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    charge: chargeId,
    amount,
    reason,
  });
}

// ─── Create Checkout Session ────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for invoice payment
 *
 * @param userId - User ID
 * @param invoiceId - Invoice ID
 * @param successUrl - URL to redirect on success
 * @param cancelUrl - URL to redirect on cancel
 * @returns Promise<Stripe.Checkout.Session>
 */
export async function createCheckoutSession(
  userId: string,
  invoiceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  // Get invoice
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.balance <= 0) {
    throw new Error('Invoice is already paid');
  }

  // Get or create Stripe customer if email is available
  let customerId: string | undefined;
  if (invoice.customerEmail) {
    customerId = await getOrCreateStripeCustomer(invoiceId, {
      email: invoice.customerEmail,
      name: invoice.customerName,
      address: invoice.customerAddress as any,
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : invoice.customerEmail || undefined,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: (invoice.currency || 'USD').toLowerCase(),
          unit_amount: invoice.balance,
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: invoice.notes || undefined,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      userId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// ─── Handle Payment Success (Webhook) ───────────────────────────────────────

/**
 * Handle successful payment from Stripe webhook
 * This should be called from the Stripe webhook handler
 *
 * @param paymentIntentId - Stripe Payment Intent ID
 * @returns Promise<void>
 */
export async function handlePaymentSuccess(paymentIntentId: string): Promise<void> {
  // Get payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const invoiceId = paymentIntent.metadata.invoiceId;
  const userId = paymentIntent.metadata.userId;

  if (!invoiceId || !userId) {
    throw new Error('Missing invoice or user ID in payment intent metadata');
  }

  // Get invoice
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Create payment record and update invoice in transaction
  await prisma.$transaction(async (tx) => {
    // Create payment record
    await tx.payment.create({
      data: {
        userId,
        invoiceId,
        amount: paymentIntent.amount,
        paymentDate: new Date(),
        paymentMethod: 'stripe',
        status: 'completed',
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge as string,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Update invoice
    const newPaidAmount = invoice.paidAmount + paymentIntent.amount;
    const newBalance = invoice.total - newPaidAmount;

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newBalance === 0 ? 'paid' : invoice.status,
        paidAt: newBalance === 0 ? new Date() : invoice.paidAt,
        updatedBy: userId,
      },
    });
  });
}

// ─── Handle Refund (Webhook) ────────────────────────────────────────────────

/**
 * Handle refund from Stripe webhook
 *
 * @param chargeId - Stripe Charge ID
 * @param refundAmount - Refund amount
 * @returns Promise<void>
 */
export async function handleRefund(chargeId: string, refundAmount: number): Promise<void> {
  // Find payment by charge ID
  const payment = await prisma.payment.findFirst({
    where: { stripeChargeId: chargeId },
    include: { invoice: true },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Update payment and invoice in transaction
  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
        updatedBy: payment.userId,
      },
    });

    // Update invoice
    const newPaidAmount = payment.invoice.paidAmount - refundAmount;
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
        updatedBy: payment.userId,
      },
    });
  });
}
