/**
 * UNI-172: Stock API - Get All Stock Levels
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getStockLevels } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

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
    const productId = searchParams.get('productId') || undefined;

    const stockLevels = await getStockLevels(userId, productId);

    return NextResponse.json({
      success: true,
      data: stockLevels,
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
