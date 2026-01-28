/**
 * UNI-173: Payments API - List
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listPayments } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// GET: List payments with filters
export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Filters
    const filters: any = {};

    if (searchParams.get('invoiceId')) {
      filters.invoiceId = searchParams.get('invoiceId');
    }

    if (searchParams.get('paymentMethod')) {
      filters.paymentMethod = searchParams.get('paymentMethod');
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }

    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    if (searchParams.get('minAmount')) {
      filters.minAmount = parseInt(searchParams.get('minAmount')!);
    }

    if (searchParams.get('maxAmount')) {
      filters.maxAmount = parseInt(searchParams.get('maxAmount')!);
    }

    const result = await listPayments(userId, filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
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
