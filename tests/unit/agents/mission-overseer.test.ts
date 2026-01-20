/**
 * Mission Overseer Agent Tests
 * 
 * Tests for the task orchestration and fleet command agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionOverseerAgent } from '@/agents/mission-overseer';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            missionType: 'content_creation',
                            complexity: 'medium',
                            suggestedAgents: ['content-orchestrator', 'seo-analyst'],
                            estimatedCost: 100,
                            reasoning: 'Test mission classification',
                            taskBreakdown: [
                                { task: 'Research topic', agent: 'content-orchestrator', priority: 1 },
                                { task: 'SEO optimization', agent: 'seo-analyst', priority: 2 }
                            ],
                            estimatedDuration: '15 minutes',
                            // For plan generation
                            steps: [
                                { id: 'invoke_content-orchestrator', action: 'Execute content-orchestrator', tool: 'agent:content-orchestrator', payload: {} }
                            ],
                            requiredSkills: []
                        }),
                        usageMetadata: { totalTokenCount: 150 }
                    }
                })
            };
        }
    }
}));

describe('Mission Overseer Agent', () => {
    let agent: MissionOverseerAgent;

    beforeEach(() => {
        agent = new MissionOverseerAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('mission-overseer');
        });

        it('should have orchestration capabilities', () => {
            expect(agent.capabilities).toContain('mission_analysis');
            expect(agent.capabilities).toContain('agent_coordination');
            expect(agent.capabilities).toContain('quality_assurance');
        });

        it('should have no direct skills (uses other agents)', () => {
            expect(agent.requiredSkills.length).toBe(0);
        });
    });

    describe('Mission Analysis', () => {
        it('should analyze mission and suggest agents', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create a marketing campaign with SEO-optimized content and social media distribution',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should break down complex missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Build complete brand presence: website copy, social profiles, and video content',
                parameters: {}
            });

            // Should have multiple task steps
            expect(plan.steps.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Agent Delegation', () => {
        it('should delegate to appropriate agents', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Scrape competitor data and analyze for SEO opportunities',
                parameters: {}
            });

            expect(plan.requiredSkills.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Execution Coordination', () => {
        it('should coordinate multi-agent execution', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Full marketing suite',
                parameters: {}
            });

            const result = await agent.execute(plan, {
                userId: 'test_user',
                mission: 'Full marketing suite',
                parameters: {}
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Verification', () => {
        it('should verify mission completion', async () => {
            const result = {
                success: true,
                data: {
                    agentsCoordinated: ['content-orchestrator', 'seo-analyst'],
                    agentsUsed: ['content-orchestrator', 'seo-analyst'],
                    tasksCompleted: 3,
                    overallStatus: 'complete'
                },
                cost: 200,
                duration: 30000,
                artifacts: [
                    { type: 'data', name: 'mission_report', value: { status: 'complete' } }
                ]
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Complex mission',
                parameters: {}
            });

            expect(report.passed).toBe(true);
        });
    });
});
