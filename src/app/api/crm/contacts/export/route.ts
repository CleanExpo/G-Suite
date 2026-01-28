/**
 * UNI-171: Contacts CSV Export API
 *
 * GET /api/crm/contacts/export - Export contacts to CSV
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listContacts, generateContactsCSV } from '@/lib/crm';

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

    const filters = {
      status: searchParams.get('status') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Fetch all contacts (no pagination limit for export)
    const result = await listContacts(userId, filters, 1, 10000);

    // Generate CSV
    const csv = generateContactsCSV(result.items);

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('[CRM Contacts Export] Error:', error);
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
