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
                            steps: [
                                { id: 'citation_analysis', action: 'Analyze Citation Vector signals', tool: 'geo_citation_analyzer', payload: {} },
                                { id: 'authority_research', action: 'Deep research on topical authority', tool: 'deep_research', payload: {} },
                                { id: 'llm_visibility', action: 'Audit visibility across LLM platforms', tool: 'llm_visibility_audit', payload: {} },
                                { id: 'authority_scoring', action: 'Calculate Primary Authority Score', tool: 'authority_scorer', payload: {} },
                                { id: 'content_optimization', action: 'Generate citation-worthy content recommendations', tool: 'gemini_3_flash', payload: {} },
                                { id: 'forensic_layer', action: 'Apply Forensic Stylistic Layer validation', tool: 'content_humanizer', payload: {} }
                            ],
                            estimatedCost: 250,
                            requiredSkills: ['gemini_3_flash', 'deep_research', 'web_intel'],
                            reasoning: 'Comprehensive Synthex Apex Architecture GEO audit'
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
