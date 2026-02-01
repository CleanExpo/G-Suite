import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MissionOverseerAgent } from '@/agents/mission-overseer';
import { AgentContext } from '@/agents/base';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mission, platform, audience, goals, budget = 200 } = body;

    // 1. Check Rate Limit (1 campaign per 5 minutes per user)
    const { QuotaManager } = await import('@/lib/security/quota-manager');
    const canExecute = await QuotaManager.checkRateLimit(userId, 'campaign_create', 1, 300);
    if (!canExecute) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait 5 minutes between missions.' },
        { status: 429 },
      );
    }

    // 2. Check Credits (Min 200 for campaign)
    const quotaCheck = await QuotaManager.checkBalance(userId, 200);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 402 });
    }

    if (!mission) {
      return NextResponse.json({ error: 'Mission objective is required' }, { status: 400 });
    }

    // Initialize Overseer
    const overseer = new MissionOverseerAgent();

    // Construct context for the marketing mission
    const context: AgentContext = {
      mission: `Campaign Creation: ${mission} for ${audience} on ${platform}. Goals: ${goals}`,
      userId: userId,
      config: {
        budget,
        explicitAgents: ['marketing-strategist'],
      },
    };

    // Plan the mission
    const plan = await overseer.plan(context);

    // Execute the mission asynchronously
    // In a production app, we would use a Background Job / Queue (BullMQ)
    // For G-Pilot, the Overseer handles execution and persistence via Firebase/Prisma

    // We trigger execution but return the initial plan and mission ID
    // The frontend will poll/listen for updates via Firebase
    const executionPromise = overseer.execute(plan, context);

    // Note: In Next.js App Router, we should be careful with unawaited promises in routes
    // ideally this is handled by a worker, but for this agentic flow, we'll return the plan
    // and let the client track the result.

    return NextResponse.json({
      success: true,
      missionId: context.mission, // Currently using mission string as temporary ID
      plan,
      message: 'Campaign orchestration initialized',
    });
  } catch (error: any) {
    console.error('[Campaign API] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to initialize campaign', details: error.message },
      { status: 500 },
    );
  }
}
