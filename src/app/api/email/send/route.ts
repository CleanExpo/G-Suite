/**
 * Email Send API
 * 
 * POST /api/email/send
 * Send single or bulk emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEmailClient } from '@/lib/email/email-client';
import type { EmailAPIResponse, SendEmailResult, BulkSendResult } from '@/lib/email/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, subject, html, text, bulk } = body;

        if (!to) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_TO', message: 'Recipient required' } },
                { status: 400 }
            );
        }

        const client = getEmailClient();

        if (!client.isConfigured()) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_CONFIGURED', message: 'Email provider not configured' } },
                { status: 503 }
            );
        }

        // Bulk send
        if (bulk && Array.isArray(to)) {
            const messages = to.map((recipient: any) => ({
                to: { email: recipient.email, name: recipient.name },
                subject: recipient.subject || subject,
                html: recipient.html || html,
                text: recipient.text || text,
                from: undefined, // Use default
            }));

            const result = await client.sendBulk(messages);

            const response: EmailAPIResponse<BulkSendResult> = {
                success: result.failed === 0,
                data: result,
            };

            return NextResponse.json(response);
        }

        // Single send
        const toAddress = typeof to === 'string' ? { email: to } : to;

        const result = await client.send({
            to: toAddress,
            subject,
            html,
            text,
            from: undefined, // Use default
        });

        const response: EmailAPIResponse<SendEmailResult> = {
            success: result.success,
            data: result,
            error: result.error,
        };

        return NextResponse.json(response, { status: result.success ? 200 : 500 });
    } catch (error: any) {
        console.error('[Email API] Send error:', error.message);
        return NextResponse.json(
            { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
            { status: 500 }
        );
    }
}
