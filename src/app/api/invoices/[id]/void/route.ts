/**
 * UNI-173: Void Invoice API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { voidInvoice } from '@/lib/invoices';

export const dynamic = 'force-dynamic';

// POST: Void/cancel invoice
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
    const invoice = await voidInvoice(userId, id);

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
