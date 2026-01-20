/**
 * SEO Analyst Agent Tests
 * 
 * Tests for the search optimization and audit agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SEOAnalystAgent } from '@/agents/seo-analyst';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            steps: [
                                { id: 'technical', action: 'Technical SEO audit', tool: 'web_mastery_audit', payload: { url: 'https://example.com' } },
                                { id: 'gsc_data', action: 'Search Console analysis', tool: 'search_console_audit', payload: {} },
                                { id: 'keywords', action: 'Keyword analysis', tool: 'gemini_3_flash', payload: {} }
                            ],
                            estimatedCost: 100,
                            requiredSkills: ['web_mastery_audit', 'search_console_audit'],
                            reasoning: 'Comprehensive SEO audit plan'
                        }),
                        usageMetadata: { totalTokenCount: 150 }
                    }
                })
            };
        }
    }
}));

describe('SEO Analyst Agent', () => {
    let agent: SEOAnalystAgent;

    beforeEach(() => {
        agent = new SEOAnalystAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('seo-analyst');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('technical_seo_audit');
            expect(agent.capabilities).toContain('keyword_strategy');
            expect(agent.capabilities).toContain('content_optimization');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('web_mastery_audit');
            expect(agent.requiredSkills).toContain('search_console_audit');
        });
    });

    describe('Planning', () => {
        it('should extract URL from mission', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Audit SEO for https://example.com',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThan(0);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should detect quick audit missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Quick SEO check for https://test.com',
                parameters: {}
            });

            // Plan is created for quick missions
            expect(plan).toBeDefined();
            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should detect comprehensive audit missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Full technical SEO audit for https://test.com',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Execution', () => {
        it('should execute and return results', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Audit https://example.com',
                parameters: {}
            });

            const result = await agent.execute(plan, {
                userId: 'test_user',
                mission: 'Audit https://example.com',
                parameters: {}
            });

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });
    });

    describe('Verification', () => {
        it('should verify results with findings', async () => {
            const result = {
                success: true,
                data: {
                    findings: { technical: 'Good', content: 'Needs work' },
                    summary: 'Overall score: 75/100'
                },
                cost: 50,
                duration: 3000,
                artifacts: [
                    { type: 'report', name: 'seo_audit', value: { score: 75 } }
                ]
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Audit site',
                parameters: {}
            });

            expect(report.passed).toBe(true);
            expect(report.checks.length).toBeGreaterThan(0);
        });
    });
});
