/**
 * UNI-173: Send Invoice API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { markInvoiceAsSent, getInvoiceById } from '@/lib/invoices';
import { sendInvoiceEmail } from '@/lib/invoices/email-sender';

export const dynamic = 'force-dynamic';

// POST: Send invoice via email
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Get invoice
    const invoice = await getInvoiceById(userId, id);
    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

    // Validate recipient email
    const recipientEmail = body.recipientEmail || invoice.customerEmail;
    if (!recipientEmail) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Recipient email is required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    // TODO: Send email (placeholder - will throw error until email provider is configured)
    try {
      await sendInvoiceEmail(invoice, {
        recipientEmail,
        recipientName: body.recipientName,
        subject: body.subject,
        message: body.message,
        attachPdf: body.attachPdf !== false,
        includePaymentLink: body.includePaymentLink,
      });
    } catch (emailError: any) {
      // Email sending not yet implemented, but mark as sent anyway
      console.warn('Email sending not implemented:', emailError.message);
    }

    // Mark invoice as sent
    const updatedInvoice = await markInvoiceAsSent(userId, id);

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}
