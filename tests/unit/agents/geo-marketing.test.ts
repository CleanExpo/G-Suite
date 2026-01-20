/**
 * GEO Marketing Agent Tests
 * 
 * Tests for the Generative Engine Optimization agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeoMarketingAgent } from '@/agents/geo-marketing-agent';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            citationVector: {
                                primaryAuthority: 0.85,
                                contentOriginality: 0.92,
                                expertiseDemonstration: 0.78
                            },
                            llmVisibility: {
                                perplexity: 'high',
                                chatgpt: 'medium',
                                claude: 'high'
                            },
                            recommendations: [
                                'Increase first-person expert quotes',
                                'Add more structured data',
                                'Improve source attribution'
                            ]
                        }),
                        usageMetadata: { totalTokenCount: 200 }
                    }
                })
            };
        }
    }
}));

describe('GEO Marketing Agent', () => {
    let agent: GeoMarketingAgent;

    beforeEach(() => {
        agent = new GeoMarketingAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('geo-marketing-agent');
        });

        it('should have GEO-specific capabilities', () => {
            expect(agent.capabilities).toContain('citation_vector_analysis');
            expect(agent.capabilities).toContain('llm_visibility_audit');
            expect(agent.capabilities).toContain('authority_scoring');
        });

        it('should have required skills for GEO', () => {
            expect(agent.requiredSkills).toContain('gemini_3_flash');
            expect(agent.requiredSkills).toContain('deep_research');
        });
    });

    describe('Planning', () => {
        it('should create citation vector analysis plan', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Analyze citation vectors for https://mybrand.com',
                parameters: {}
            });

            expect(plan.steps.some(s =>
                s.action?.toLowerCase().includes('citation') ||
                s.id?.includes('citation')
            )).toBe(true);
        });

        it('should create LLM visibility audit plan', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Audit LLM visibility for our brand',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should detect content optimization missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Optimize content for AI search engines',
                parameters: {}
            });

            expect(plan.steps.some(s =>
                s.action?.toLowerCase().includes('optim') ||
                s.action?.toLowerCase().includes('content')
            )).toBe(true);
        });
    });

    describe('Citation Vector Scoring', () => {
        it('should return citation vector scores in execution', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Analyze citations for https://example.com',
                parameters: {}
            });

            const result = await agent.execute(plan, {
                userId: 'test_user',
                mission: 'Analyze citations',
                parameters: {}
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Verification', () => {
        it('should verify GEO audit results', async () => {
            const result = {
                success: true,
                data: {
                    citationVector: { primaryAuthority: 0.85 },
                    llmVisibility: { perplexity: 'high' },
                    recommendations: ['Improve authority signals']
                },
                cost: 100,
                duration: 8000,
                artifacts: []
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'GEO audit',
                parameters: {}
            });

            expect(report.passed).toBe(true);
        });
    });
});
