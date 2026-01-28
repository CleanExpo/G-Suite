/**
 * UNI-171: Contacts API
 *
 * POST /api/crm/contacts - Create a new contact
 * GET  /api/crm/contacts - List contacts with filtering
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createContact, listContacts } from '@/lib/crm';

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

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'First name and last name are required',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const contact = await createContact(userId, body);

    return NextResponse.json(
      {
        success: true,
        data: contact,
        meta: { version: 'v1', timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[CRM Contacts POST] Error:', error);
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filters = {
      status: searchParams.get('status') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      search: searchParams.get('search') || undefined,
      leadScore: searchParams.get('leadScore')
        ? parseInt(searchParams.get('leadScore')!)
        : undefined,
      tags: searchParams.getAll('tags'),
    };

    const result = await listContacts(userId, filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    console.error('[CRM Contacts GET] Error:', error);
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
