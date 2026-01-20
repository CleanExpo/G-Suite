/**
 * Marketing Strategist Agent Tests
 * 
 * Tests for the campaign planning and strategy agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketingStrategistAgent } from '@/agents/marketing-strategist';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            steps: [
                                { id: 'research', action: 'Research market and audience content', tool: 'deep_research', payload: {} },
                                { id: 'strategy', action: 'Develop campaign strategy', tool: 'gemini_3_flash', payload: {} },
                                { id: 'calendar', action: 'Create content calendar', tool: 'gemini_3_flash', payload: {} }
                            ],
                            estimatedCost: 125,
                            requiredSkills: ['deep_research', 'gemini_3_flash'],
                            reasoning: 'Comprehensive marketing strategy plan'
                        }),
                        usageMetadata: { totalTokenCount: 180 }
                    }
                })
            };
        }
    }
}));

describe('Marketing Strategist Agent', () => {
    let agent: MarketingStrategistAgent;

    beforeEach(() => {
        agent = new MarketingStrategistAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('marketing-strategist');
        });

        it('should have campaign planning capabilities', () => {
            expect(agent.capabilities).toContain('campaign_planning');
            expect(agent.capabilities).toContain('audience_targeting');
            expect(agent.capabilities).toContain('content_strategy');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills.length).toBeGreaterThan(0);
        });
    });

    describe('Planning', () => {
        it('should create campaign plans', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create a marketing campaign for product launch',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThan(0);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should detect content calendar missions', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Build a content calendar for Q1 2026',
                parameters: {}
            });

            expect(plan.steps.some(s =>
                s.action?.toLowerCase().includes('calendar') ||
                s.action?.toLowerCase().includes('content')
            )).toBe(true);
        });
    });

    describe('Execution', () => {
        it('should execute strategy plan', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create marketing strategy',
                parameters: {}
            });

            const result = await agent.execute(plan, {
                userId: 'test_user',
                mission: 'Create marketing strategy',
                parameters: {}
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Verification', () => {
        it('should verify strategy results', async () => {
            const result = {
                success: true,
                data: {
                    strategy: { objective: 'Growth', channels: ['social'] },
                    deliverables: ['content_calendar', 'campaign_brief']
                },
                cost: 75,
                duration: 5000,
                artifacts: [
                    { type: 'data', name: 'strategy', value: { objective: 'Growth' } },
                    { type: 'data', name: 'video_ad', value: { url: 'https://test.com/video.mp4' } }
                ]
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Strategy',
                parameters: {}
            });

            expect(report.passed).toBe(true);
        });
    });
});
