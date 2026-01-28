/**
 * UNI-171: Companies API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createCompany, listCompanies } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Company name is required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } },
        { status: 400 }
      );
    }

    const company = await createCompany(userId, body);
    return NextResponse.json({ success: true, data: company, meta: { version: 'v1', timestamp: new Date().toISOString() } }, { status: 201 });
  } catch (error: any) {
    console.error('[CRM Companies POST] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' }, meta: { version: 'v1', timestamp: new Date().toISOString() } },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filters = {
      status: searchParams.get('status') || undefined,
      industry: searchParams.get('industry') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const result = await listCompanies(userId, filters, page, limit);
    return NextResponse.json({ success: true, data: result, meta: { version: 'v1', timestamp: new Date().toISOString() } });
  } catch (error: any) {
    console.error('[CRM Companies GET] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message }, meta: { version: 'v1', timestamp: new Date().toISOString() } },
      { status: 500 }
    );
  }
}
