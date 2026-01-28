/**
 * UNI-173: Stripe Payment Intent API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// POST: Create Stripe Payment Intent for invoice
export async function POST(req: Request) {
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
    const body = await req.json();

    // Validate required fields
    if (!body.invoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Invoice ID is required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(userId, body.invoiceId, {
      amount: body.amount,
      currency: body.currency,
      customerEmail: body.customerEmail,
      description: body.description,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
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
