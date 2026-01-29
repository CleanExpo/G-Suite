/**
 * Email Templates API
 * 
 * GET/POST /api/email/templates
 * Template management
 */

import { NextRequest, NextResponse } from 'next/server';
import type { EmailAPIResponse, EmailTemplate } from '@/lib/email/types';

// In-memory template store (replace with database in production)
const templates: Map<string, EmailTemplate> = new Map([
    ['welcome', {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{company}}!',
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Welcome, {{name}}!</h1>
                <p>Thank you for joining {{company}}. We're excited to have you on board.</p>
                <a href="{{dashboard_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
                    Get Started
                </a>
            </div>
        `,
        textContent: 'Welcome, {{name}}! Thank you for joining {{company}}.',
        variables: [
            { name: 'name', type: 'string', required: true },
            { name: 'company', type: 'string', required: true },
            { name: 'dashboard_url', type: 'url', required: true },
        ],
        category: 'onboarding',
        createdAt: new Date(),
        updatedAt: new Date(),
    }],
    ['campaign-report', {
        id: 'campaign-report',
        name: 'Campaign Report',
        subject: 'Your {{campaign_name}} Report is Ready',
        htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Campaign Report</h1>
                <p>Hi {{name}},</p>
                <p>Your campaign <strong>{{campaign_name}}</strong> has completed. Here are the results:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background: #f3f4f6;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">Sent</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">{{sent}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">Delivered</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">{{delivered}}</td>
                    </tr>
                    <tr style="background: #f3f4f6;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">Open Rate</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">{{open_rate}}%</td>
                    </tr>
                </table>
                <a href="{{report_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View Full Report
                </a>
            </div>
        `,
        variables: [
            { name: 'name', type: 'string', required: true },
            { name: 'campaign_name', type: 'string', required: true },
            { name: 'sent', type: 'number', required: true },
            { name: 'delivered', type: 'number', required: true },
            { name: 'open_rate', type: 'number', required: true },
            { name: 'report_url', type: 'url', required: true },
        ],
        category: 'reports',
        createdAt: new Date(),
        updatedAt: new Date(),
    }],
]);

export async function GET() {
    const templateList = Array.from(templates.values());

    const response: EmailAPIResponse<EmailTemplate[]> = {
        success: true,
        data: templateList,
    };

    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, subject, htmlContent, textContent, variables, category } = body;

        if (!name || !subject || !htmlContent) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_FIELDS', message: 'name, subject, and htmlContent required' } },
                { status: 400 }
            );
        }

        const id = name.toLowerCase().replace(/\s+/g, '-');
        const now = new Date();

        const template: EmailTemplate = {
            id,
            name,
            subject,
            htmlContent,
            textContent,
            variables: variables || [],
            category,
            createdAt: now,
            updatedAt: now,
        };

        templates.set(id, template);

        const response: EmailAPIResponse<EmailTemplate> = {
            success: true,
            data: template,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
            { status: 500 }
        );
    }
}
