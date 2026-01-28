/**
 * UNI-172: Stock Adjust API - Adjust Stock Levels
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { adjustStock } from '@/lib/inventory';

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

    if (!body.productId || !body.warehouseId || !body.quantity || !body.type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'productId, warehouseId, quantity, and type are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    if (!['in', 'out', 'adjustment'].includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'type must be one of: in, out, adjustment',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const result = await adjustStock(userId, body);

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
