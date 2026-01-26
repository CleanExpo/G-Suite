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
        // Unified Entry: Delegate to Mission Overseer
        const overseer = AgentRegistry.get('mission-overseer');

        if (!overseer) {
            return NextResponse.json({
                success: false,
                error: 'System Error: Mission Overseer not available'
            }, { status: 500 });
        }

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                // Helper to stream logs
                const sendLog = (msg: string) => {
                    // Send as Server-Sent Event style or just raw text lines
                    // Using a simple prefix convention for client parsing
                    controller.enqueue(encoder.encode(`LOG:${msg}\n`));
                };

                const context = {
                    userId: userId || 'api-user',
                    mission,
                    config: {
                        ...config,
                        explicitAgents: [agentName]
                    },
                    onStream: sendLog
                };

                try {
                    // Execute unified loop
                    sendLog(`Initializing Mission for ${agentName}...`);

                    const plan = await overseer.plan(context);
                    sendLog(`Plan created with ${plan.steps.length} steps.`);

                    const result = await overseer.execute(plan, context);
                    sendLog(`Execution complete. Success: ${result.success}`);

                    const verification = await overseer.verify(result, context);
                    sendLog(`Verification status: ${verification.passed ? 'PASSED' : 'FAILED'}`);

                    // Send Final Result as JSON
                    const finalResponse = {
                        success: true,
                        agentName: 'mission-overseer',
                        targetAgent: agentName,
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
                            artifactCount: result.artifacts?.length || 0,
                            audits: (result.data as any)?.audits
                        },
                        verification: {
                            passed: verification.passed,
                            checks: verification.checks
                        }
                    };

                    controller.enqueue(encoder.encode(`RESULT:${JSON.stringify(finalResponse)}\n`));
                } catch (error: any) {
                    controller.enqueue(encoder.encode(`ERROR:${error.message}\n`));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
