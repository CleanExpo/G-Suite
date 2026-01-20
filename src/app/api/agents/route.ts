/**
 * Agents API
 * 
 * REST API for agent invocation, status, and management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentRegistry, initializeAgents } from '@/agents/registry';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agents - List all available agents
 */
export async function GET(): Promise<Response> {
    try {
        await initializeAgents();
        const agentNames = AgentRegistry.getAvailableAgents();

        const agents = agentNames.map(name => {
            const agent = AgentRegistry.get(name);
            return {
                name,
                description: agent?.description || 'No description',
                capabilities: agent?.capabilities || [],
                requiredSkills: agent?.requiredSkills || [],
                status: 'ready'
            };
        });

        return NextResponse.json({
            success: true,
            count: agents.length,
            agents
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * POST /api/agents - Invoke an agent mission
 */
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const body = await request.json();
        const { agentName, mission, userId, config } = body;

        if (!agentName || !mission) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: agentName, mission'
            }, { status: 400 });
        }

        await initializeAgents();
        const agent = AgentRegistry.get(agentName);

        if (!agent) {
            return NextResponse.json({
                success: false,
                error: `Agent not found: ${agentName}`
            }, { status: 404 });
        }

        // Plan phase
        const context = {
            userId: userId || 'api-user',
            mission,
            config
        };

        const plan = await agent.plan(context);

        // Execute phase
        const result = await agent.execute(plan, context);

        // Verify phase
        const verification = await agent.verify(result, context);

        return NextResponse.json({
            success: true,
            agentName,
            mission,
            plan: {
                steps: plan.steps.length,
                estimatedCost: plan.estimatedCost,
                reasoning: plan.reasoning
            },
            result: {
                success: result.success,
                duration: result.duration,
                cost: result.cost,
                artifactCount: result.artifacts?.length || 0
            },
            verification: {
                passed: verification.passed,
                checks: verification.checks
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
