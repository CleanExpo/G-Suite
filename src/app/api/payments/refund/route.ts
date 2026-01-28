/**
 * UNI-173: Payment Refund API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { refundPayment } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// POST: Process payment refund
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
    if (!body.paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Payment ID is required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const payment = await refundPayment(
      userId,
      body.paymentId,
      body.refundAmount,
      body.notes
    );

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
