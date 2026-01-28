/**
 * UNI-173: Invoices API - Create & List
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createInvoice, listInvoices } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// POST: Create new invoice
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
    if (!body.customerName || !body.dueDate || !body.lineItems || body.lineItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Customer name, due date, and line items are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const invoice = await createInvoice(userId, {
      customerId: body.customerId,
      companyId: body.companyId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerAddress: body.customerAddress,
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
      dueDate: new Date(body.dueDate),
      taxRate: body.taxRate,
      discountAmount: body.discountAmount,
      currency: body.currency,
      notes: body.notes,
      terms: body.terms,
      footer: body.footer,
      customFields: body.customFields,
      lineItems: body.lineItems,
    });

    return NextResponse.json({
      success: true,
      data: invoice,
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

// GET: List invoices with filters
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

    if (searchParams.get('status')) {
      const statuses = searchParams.get('status')!.split(',');
      filters.status = statuses.length === 1 ? statuses[0] : statuses;
    }

    if (searchParams.get('customerId')) {
      filters.customerId = searchParams.get('customerId');
    }

    if (searchParams.get('companyId')) {
      filters.companyId = searchParams.get('companyId');
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

    if (searchParams.get('search')) {
      filters.searchTerm = searchParams.get('search');
    }

    const result = await listInvoices(userId, filters, page, limit);

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
