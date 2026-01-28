/**
 * UNI-172: Stock Transfer API - Transfer Between Warehouses
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { transferStock } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

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

    if (!body.productId || !body.fromWarehouseId || !body.toWarehouseId || !body.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'productId, fromWarehouseId, toWarehouseId, and quantity are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    if (body.fromWarehouseId === body.toWarehouseId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Source and destination warehouses must be different',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const result = await transferStock(userId, body);

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
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
