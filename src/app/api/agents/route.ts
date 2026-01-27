/**
 * Agents API
 *
 * REST API for agent invocation, status, and management.
 * Uses Vercel AI SDK UIMessageStream protocol for real-time streaming.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { AgentRegistry, initializeAgents } from '@/agents/registry';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
 * POST /api/agents - Invoke an agent mission via AI SDK UIMessageStream
 *
 * Accepts both:
 * - useChat format: { messages: [...], agentName?, config? }
 * - Legacy format:  { agentName, mission, userId?, config? }
 */
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const body = await request.json();

        // Support both useChat format (messages array) and legacy format (mission string)
        let mission: string;
        const agentName = body.agentName || 'mission-overseer';
        const userId = body.userId;
        const config = body.config;

        if (body.messages && Array.isArray(body.messages)) {
            // useChat format: extract mission from last user message
            const lastUserMsg = [...body.messages].reverse().find(
                (m: any) => m.role === 'user'
            );
            if (lastUserMsg?.parts) {
                const textPart = lastUserMsg.parts.find((p: any) => p.type === 'text');
                mission = textPart?.text || '';
            } else if (lastUserMsg?.content) {
                // Fallback for older message format
                mission = typeof lastUserMsg.content === 'string'
                    ? lastUserMsg.content
                    : '';
            } else {
                mission = '';
            }
        } else {
            mission = body.mission || '';
        }

        if (!mission) {
            return NextResponse.json({
                success: false,
                error: 'Missing required field: mission'
            }, { status: 400 });
        }

        await initializeAgents();
        const overseer = AgentRegistry.get('mission-overseer');

        if (!overseer) {
            return NextResponse.json({
                success: false,
                error: 'System Error: Mission Overseer not available'
            }, { status: 500 });
        }

        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                const textId = 'mission-log';

                writer.write({ type: 'start' });
                writer.write({ type: 'text-start', id: textId });

                const sendLog = (msg: string) => {
                    writer.write({ type: 'text-delta', delta: msg + '\n', id: textId });
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
                    sendLog(`Initializing Mission for ${agentName}...`);

                    const plan = await overseer.plan(context);
                    sendLog(`Plan created with ${plan.steps.length} steps.`);

                    const result = await overseer.execute(plan, context);
                    sendLog(`Execution complete. Success: ${result.success}`);

                    const verification = await overseer.verify(result, context);
                    sendLog(`Verification status: ${verification.passed ? 'PASSED' : 'FAILED'}`);

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

                    sendLog(`RESULT:${JSON.stringify(finalResponse)}`);
                    sendLog('Mission Complete.');
                } catch (error: any) {
                    sendLog(`ERROR: ${error.message}`);
                }

                writer.write({ type: 'text-end', id: textId });
                writer.write({ type: 'finish', finishReason: 'stop' });
            },
            onError: (error) => {
                console.error('[Agents API] Stream error:', error);
                return error instanceof Error ? error.message : 'Stream error';
            }
        });

        return createUIMessageStreamResponse({ stream });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
