/**
 * UNI-173: Invoice PDF Generation API
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/invoices';
import { generateInvoicePDF } from '@/lib/invoices/pdf-generator';

export const dynamic = 'force-dynamic';

// GET: Generate and download invoice PDF
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Get invoice
    const invoice = await getInvoiceById(userId, id);
    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 404 }
      );
    }

    // TODO: Generate PDF (placeholder - will throw error until @react-pdf/renderer is installed)
    try {
      const pdfBuffer = await generateInvoicePDF(invoice);

      // Return PDF as download
      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        },
      });
    } catch (pdfError: any) {
      // PDF generation not yet implemented
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'PDF generation not yet implemented. Install @react-pdf/renderer to enable this feature.',
          },
          meta: { version: 'v1', timestamp: new Date().toISOString() },
        },
        { status: 501 }
      );
    }
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
