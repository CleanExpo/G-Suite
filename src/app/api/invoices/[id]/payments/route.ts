/**
 * UNI-173: Record Payment API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { recordPayment } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// POST: Record payment for invoice
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

    // Validate required fields
    if (!body.amount || !body.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Amount and payment method are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const payment = await recordPayment(userId, id, {
      amount: body.amount,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
      paymentMethod: body.paymentMethod,
      referenceNumber: body.referenceNumber,
      notes: body.notes,
      customFields: body.customFields,
    });

    return NextResponse.json({
      success: true,
      data: payment,
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
