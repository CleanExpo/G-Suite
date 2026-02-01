import { NextRequest, NextResponse } from 'next/server';
import { deepResearchClient } from '@/lib/google/deep-research-client';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic, options } = body;

    // 1. Rate Limit (2 research missions per 1 minute)
    const { QuotaManager } = await import('@/lib/security/quota-manager');
    const canExecute = await QuotaManager.checkRateLimit(userId, 'deep_research', 2, 60);
    if (!canExecute) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 2 research missions per minute.' },
        { status: 429 },
      );
    }

    // 2. Check Credits (Min 50 for deep research)
    const quotaCheck = await QuotaManager.checkBalance(userId, 50);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 402 });
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const result = await deepResearchClient.research(topic, options);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Research API] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
