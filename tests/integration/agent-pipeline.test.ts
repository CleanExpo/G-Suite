/**
 * Agent Pipeline Integration Tests
 * 
 * End-to-end tests for agent execution pipelines.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgentRegistry, initializeAgents } from '@/agents/registry';

// Mock all Google AI dependencies
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            // For generic agents
                            success: true,
                            category: 'content',
                            analysis: 'Test analysis result',
                            recommendations: ['Recommendation 1', 'Recommendation 2'],
                            // For mission-overseer (analysis)
                            missionType: 'content',
                            complexity: 'medium',
                            suggestedAgents: ['content-orchestrator'],
                            estimatedCost: 100,
                            reasoning: 'Test fallback',
                            // For plan generation
                            steps: [
                                { id: 'step_1', action: 'Research topic', tool: 'deep_research', payload: {} },
                                { id: 'step_2', action: 'Generate content', tool: 'gemini_3_flash', payload: {} }
                            ],
                            requiredSkills: ['deep_research', 'gemini_3_flash']
                        }),
                        usageMetadata: { totalTokenCount: 100 }
                    }
                })
            };
        }
    }
}));

describe('Agent Pipeline Integration', () => {
    beforeEach(async () => {
        // Clear and reinitialize registry for each test
        AgentRegistry.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Registry Integration', () => {
        it('should initialize all core agents', async () => {
            await initializeAgents();
            const agents = AgentRegistry.list();

            expect(agents.length).toBeGreaterThan(0);
        });

        it('should retrieve agent by name', async () => {
            await initializeAgents();

            const contentAgent = AgentRegistry.get('content-orchestrator');
            expect(contentAgent).toBeDefined();
            expect(contentAgent?.name).toBe('content-orchestrator');
        });

        it('should find best agent for skill requirements', async () => {
            await initializeAgents();

            const agent = AgentRegistry.findBestAgent(['web_unlocker', 'web_crawler']);
            expect(agent).toBeDefined();
        });
    });

    describe('Content Creation Pipeline', () => {
        it('should execute content orchestrator planning', async () => {
            await initializeAgents();
            const agent = AgentRegistry.get('content-orchestrator');

            if (!agent) throw new Error('Agent not found');

            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create a presentation about cloud computing',
                parameters: {}
            });

            expect(plan).toBeDefined();
            expect(plan.steps.length).toBeGreaterThan(0);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should execute full planning-execution-verification cycle', async () => {
            await initializeAgents();
            const agent = AgentRegistry.get('content-orchestrator');

            if (!agent) throw new Error('Agent not found');

            const context = {
                userId: 'test_user',
                mission: 'Research AI trends',
                parameters: {}
            };

            // Planning phase
            const plan = await agent.plan(context);
            expect(plan).toBeDefined();

            // Execution phase
            const result = await agent.execute(plan, context);
            expect(result).toBeDefined();
            expect(result.duration).toBeGreaterThanOrEqual(0);

            // Verification phase
            const report = await agent.verify(result, context);
            expect(report).toBeDefined();
            expect(report.checks.length).toBeGreaterThan(0);
        });
    });

    describe('SEO Audit Pipeline', () => {
        it('should execute SEO analyst workflow', async () => {
            await initializeAgents();
            const agent = AgentRegistry.get('seo-analyst');

            if (!agent) throw new Error('Agent not found');

            const context = {
                userId: 'test_user',
                mission: 'Audit SEO for https://example.com',
                parameters: {}
            };

            const plan = await agent.plan(context);
            expect(plan.steps.length).toBeGreaterThan(0);

            const result = await agent.execute(plan, context);
            expect(result).toBeDefined();
        });
    });

    describe('Web Intelligence Pipeline', () => {
        it('should execute web scraper workflow', async () => {
            await initializeAgents();
            const agent = AgentRegistry.get('web-scraper');

            if (!agent) throw new Error('Agent not found');

            const context = {
                userId: 'test_user',
                mission: 'Scrape products from https://example.com/products',
                parameters: {}
            };

            const plan = await agent.plan(context);
            expect(plan).toBeDefined();

            const result = await agent.execute(plan, context);
            expect(result).toBeDefined();
        });

        it('should execute data collector workflow', async () => {
            await initializeAgents();
            const agent = AgentRegistry.get('data-collector');

            if (!agent) throw new Error('Agent not found');

            const context = {
                userId: 'test_user',
                mission: 'Collect data from multiple sources',
                parameters: {}
            };

            const plan = await agent.plan(context);
            expect(plan).toBeDefined();
        });
    });

    describe('Multi-Agent Coordination', () => {
        it('should coordinate mission across multiple agents', async () => {
            await initializeAgents();
            const overseer = AgentRegistry.get('mission-overseer');

            if (!overseer) throw new Error('Overseer not found');

            const context = {
                userId: 'test_user',
                mission: 'Create SEO-optimized content with social distribution',
                parameters: {}
            };

            const plan = await overseer.plan(context);
            expect(plan).toBeDefined();

            // Overseer should suggest multiple agents
            const result = await overseer.execute(plan, context);
            expect(result).toBeDefined();
        });
    });

    describe('GEO Marketing Pipeline', () => {
        it('should execute citation vector analysis', async () => {
            await initializeAgents();
            const agent = AgentRegistry.get('geo-marketing');

            if (!agent) throw new Error('Agent not found');

            const context = {
                userId: 'test_user',
                mission: 'Analyze citation vectors for our brand',
                parameters: {}
            };

            const plan = await agent.plan(context);
            expect(plan).toBeDefined();

            const result = await agent.execute(plan, context);
            expect(result).toBeDefined();
        });
    });
});
