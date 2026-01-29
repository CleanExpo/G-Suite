/**
 * Email Campaigns API
 * 
 * GET/POST /api/email/campaigns
 * Campaign management
 */

import { NextRequest, NextResponse } from 'next/server';
import type { EmailAPIResponse, EmailCampaign } from '@/lib/email/types';

// In-memory campaign store (replace with database in production)
const campaigns: Map<string, EmailCampaign> = new Map([
    ['demo-1', {
        id: 'demo-1',
        name: 'January Newsletter',
        status: 'sent',
        subject: 'Your January Update from G-Pilot',
        from: { email: 'newsletter@gpilot.ai', name: 'G-Pilot Team' },
        recipients: [],
        sentAt: new Date('2026-01-15'),
        stats: {
            total: 1250,
            sent: 1245,
            delivered: 1230,
            opened: 489,
            clicked: 156,
            bounced: 15,
            unsubscribed: 3,
            complained: 0,
        },
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-15'),
    }],
    ['demo-2', {
        id: 'demo-2',
        name: 'Product Launch Announcement',
        status: 'scheduled',
        subject: 'Introducing Our New Feature!',
        from: { email: 'announcements@gpilot.ai', name: 'G-Pilot' },
        recipients: [],
        scheduledAt: new Date('2026-02-01'),
        stats: {
            total: 2500,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            complained: 0,
        },
        createdAt: new Date('2026-01-25'),
        updatedAt: new Date('2026-01-28'),
    }],
]);

export async function GET() {
    const campaignList = Array.from(campaigns.values());

    const response: EmailAPIResponse<EmailCampaign[]> = {
        success: true,
        data: campaignList,
    };

    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, subject, from, templateId, recipients, scheduledAt } = body;

        if (!name || !subject) {
            return NextResponse.json(
                { success: false, error: { code: 'MISSING_FIELDS', message: 'name and subject required' } },
                { status: 400 }
            );
        }

        const id = `campaign-${Date.now()}`;
        const now = new Date();

        const campaign: EmailCampaign = {
            id,
            name,
            status: scheduledAt ? 'scheduled' : 'draft',
            templateId,
            subject,
            from: from || { email: 'noreply@gpilot.ai', name: 'G-Pilot' },
            recipients: recipients || [],
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            stats: {
                total: recipients?.length || 0,
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
                unsubscribed: 0,
                complained: 0,
            },
            createdAt: now,
            updatedAt: now,
        };

        campaigns.set(id, campaign);

        const response: EmailAPIResponse<EmailCampaign> = {
            success: true,
            data: campaign,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
            { status: 500 }
        );
    }
}
