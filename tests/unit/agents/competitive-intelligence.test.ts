/**
 * Competitive Intelligence Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            competitors: [
                {
                    name: 'Competitor A',
                    domain: 'competitor-a.com',
                    strengths: ['Strong brand', 'Large user base'],
                    weaknesses: ['Slow innovation', 'High prices'],
                    recentChanges: ['New pricing model'],
                    marketPosition: 'leader'
                }
            ],
            marketTrends: ['AI adoption increasing', 'Remote work tools growing'],
            opportunities: ['Underserved SMB market'],
            threats: ['New entrants from big tech'],
            recommendations: ['Focus on AI features', 'Target SMB segment'],
            findings: ['Market growing 15% YoY'],
            insights: ['Competitors focusing on enterprise'],
            confidence: 0.85
        })
    }
});

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class MockGoogleGenerativeAI {
            constructor() {}
            getGenerativeModel() {
                return { generateContent: mockGenerateContent };
            }
        }
    };
});

import { CompetitiveIntelligenceAgent } from '@/agents/competitive-intelligence';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('CompetitiveIntelligenceAgent', () => {
    let agent: CompetitiveIntelligenceAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new CompetitiveIntelligenceAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Analyse competitors: Acme Corp, Beta Inc for SaaS market',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('competitive-intelligence');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('competitor_monitoring');
            expect(agent.capabilities).toContain('market_analysis');
            expect(agent.capabilities).toContain('trend_detection');
            expect(agent.capabilities).toContain('swot_analysis');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('web_intel');
            expect(agent.requiredSkills).toContain('deep_research');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
            expect(plan.reasoning).toBeDefined();
        });

        it('should include discovery step', async () => {
            const plan = await agent.plan(mockContext);

            const discoverStep = plan.steps.find(s => s.id === 'discover');
            expect(discoverStep).toBeDefined();
            expect(discoverStep?.tool).toBe('deep_research');
        });

        it('should include analysis step', async () => {
            const plan = await agent.plan(mockContext);

            const analyseStep = plan.steps.find(s => s.id === 'analyse');
            expect(analyseStep).toBeDefined();
        });

        it('should include synthesis step', async () => {
            const plan = await agent.plan(mockContext);

            const synthesiseStep = plan.steps.find(s => s.id === 'synthesise');
            expect(synthesiseStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'discover', action: 'Discover competitors', tool: 'deep_research', payload: {} },
                    { id: 'analyse', action: 'Analyse positioning', tool: 'gemini_3_flash', payload: {} },
                    { id: 'synthesise', action: 'Synthesise report', tool: 'gemini_3_flash', payload: {} }
                ],
                estimatedCost: 150,
                requiredSkills: ['deep_research'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return market intelligence', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.intelligence).toBeDefined();
        });

        it('should produce artifacts', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.artifacts).toBeDefined();
            expect(result.artifacts!.length).toBeGreaterThan(0);
        });

        it('should include confidence score', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.confidence).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });
    });

    describe('verify()', () => {
        it('should pass verification with valid intelligence', async () => {
            const mockResult = {
                success: true,
                data: {
                    intelligence: {
                        competitors: [{ name: 'Test', domain: 'test.com', strengths: [], weaknesses: [], recentChanges: [], marketPosition: 'challenger' as const }],
                        marketTrends: ['Trend 1'],
                        opportunities: ['Opportunity 1'],
                        threats: ['Threat 1'],
                        recommendations: ['Recommendation 1']
                    }
                },
                cost: 100,
                duration: 5000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
            expect(report.checks.length).toBeGreaterThan(0);
        });

        it('should fail verification with no competitors', async () => {
            const mockResult = {
                success: true,
                data: {
                    intelligence: {
                        competitors: [],
                        marketTrends: [],
                        opportunities: [],
                        threats: [],
                        recommendations: []
                    }
                },
                cost: 100,
                duration: 5000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Data collection failed',
                cost: 0,
                duration: 1000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
