/**
 * UNI-171: Contacts CSV Import API
 *
 * POST /api/crm/contacts/import - Import contacts from CSV
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { parseContactsCSV, validateCSV, createContact } from '@/lib/crm';

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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'CSV file is required' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    const csvContent = await file.text();

    // Validate CSV structure
    const validation = validateCSV(csvContent);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CSV',
            message: 'CSV validation failed',
            details: validation.errors,
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    // Parse CSV
    const contactsData = parseContactsCSV(csvContent);

    // Import contacts
    const imported: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < contactsData.length; i++) {
      try {
        const contact = await createContact(userId, contactsData[i]);
        imported.push(contact);
      } catch (error: any) {
        errors.push({
          row: i + 2,
          data: contactsData[i],
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: imported.length,
        failed: errors.length,
        contacts: imported,
        errors,
      },
      meta: { version: 'v1', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    console.error('[CRM Contacts Import] Error:', error);
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
