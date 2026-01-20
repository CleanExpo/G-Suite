/**
 * Content Orchestrator Agent Tests
 * 
 * Tests for the content creation and presentation orchestration agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentOrchestratorAgent } from '@/agents/content-orchestrator';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            contentStrategy: 'Test strategy',
                            outline: ['Point 1', 'Point 2'],
                            targetAudience: 'Test audience'
                        }),
                        usageMetadata: { totalTokenCount: 100 }
                    }
                })
            };
        }
    }
}));

describe('Content Orchestrator Agent', () => {
    let agent: ContentOrchestratorAgent;

    beforeEach(() => {
        agent = new ContentOrchestratorAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('content-orchestrator');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('research_synthesis');
            expect(agent.capabilities).toContain('presentation_building');
            expect(agent.capabilities).toContain('video_production');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('notebook_lm_research');
            expect(agent.requiredSkills).toContain('veo_31_generate');
            expect(agent.requiredSkills).toContain('gemini_3_flash');
        });
    });

    describe('Planning', () => {
        it('should detect presentation missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create a presentation about AI trends',
                parameters: {}
            });

            expect(plan.steps.some(s => s.tool === 'google_slides_storyboard')).toBe(true);
            expect(plan.estimatedCost).toBeGreaterThan(75); // Base + presentation cost
        });

        it('should detect video missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create a promotional video for our product',
                parameters: {}
            });

            expect(plan.steps.some(s => s.tool === 'veo_31_generate')).toBe(true);
            expect(plan.estimatedCost).toBeGreaterThanOrEqual(250); // Base + video cost
        });

        it('should detect research missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Research market analysis for tech industry',
                parameters: {}
            });

            expect(plan.steps.some(s => s.tool === 'deep_research')).toBe(true);
        });

        it('should always include content strategy step', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Any content mission',
                parameters: {}
            });

            expect(plan.steps.some(s => s.tool === 'gemini_3_flash')).toBe(true);
        });
    });

    describe('Execution', () => {
        it('should execute plan and return success', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create content',
                parameters: {}
            });

            const result = await agent.execute(plan, {
                userId: 'test_user',
                mission: 'Create content',
                parameters: {}
            });

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Verification', () => {
        it('should verify successful results', async () => {
            const result = {
                success: true,
                data: {
                    message: 'Content created',
                    outputs: { presentation: 'https://slides.google.com/test' },
                    totalAssets: 2
                },
                cost: 175,
                duration: 5000,
                artifacts: [
                    { type: 'url', name: 'presentation', value: 'https://slides.google.com/test' }
                ]
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Create content',
                parameters: {}
            });

            expect(report.passed).toBe(true);
            expect(report.checks.some(c => c.name === 'Content Generated' && c.passed)).toBe(true);
        });

        it('should fail verification for failed results', async () => {
            const result = {
                success: false,
                error: 'Content generation failed',
                cost: 0,
                duration: 1000,
                artifacts: []
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Create content',
                parameters: {}
            });

            expect(report.passed).toBe(false);
        });
    });
});
