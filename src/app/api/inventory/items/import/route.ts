/**
 * UNI-172: Items Import API - CSV Import
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { parseProductsCSV, validateProductsCSV, createProduct } from '@/lib/inventory';

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
    const { csv } = await req.json();

    if (!csv) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'CSV content is required' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    // Validate CSV format
    const validationResult = validateProductsCSV(csv);
    if (validationResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'CSV validation failed',
            details: validationResult.errors,
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    // Parse CSV
    const products = parseProductsCSV(csv);

    // Import products
    const results = [];
    const errors = [];

    for (const product of products) {
      try {
        const created = await createProduct(userId, product);
        results.push(created);
      } catch (error: any) {
        errors.push({
          sku: product.sku,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: results.length,
        failed: errors.length,
        results,
        errors,
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
