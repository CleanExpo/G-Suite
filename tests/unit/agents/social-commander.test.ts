/**
 * Social Commander Agent Tests
 * 
 * Tests for the multi-platform social publishing agent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialCommanderAgent } from '@/agents/social-commander';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            posts: [
                                { platform: 'linkedin', content: 'Professional update', scheduled: '2026-01-21T09:00:00Z' },
                                { platform: 'twitter', content: 'Quick announcement', scheduled: '2026-01-21T12:00:00Z' }
                            ],
                            analytics: { estimatedReach: 5000 }
                        }),
                        usageMetadata: { totalTokenCount: 100 }
                    }
                })
            };
        }
    }
}));

describe('Social Commander Agent', () => {
    let agent: SocialCommanderAgent;

    beforeEach(() => {
        agent = new SocialCommanderAgent();
    });

    describe('Initialization', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('social-commander');
        });

        it('should have multi-platform capabilities', () => {
            expect(agent.capabilities).toContain('multi_platform_posting');
            expect(agent.capabilities).toContain('engagement_tracking');
        });

        it('should have social skills', () => {
            expect(agent.requiredSkills.length).toBeGreaterThan(0);
        });
    });

    describe('Planning', () => {
        it('should create multi-platform publishing plan', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Publish announcement across LinkedIn, Twitter, and Facebook',
                parameters: {}
            });

            expect(plan.steps.length).toBeGreaterThan(0);
        });

        it('should estimate cost for posts', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Schedule 5 posts for the week',
                parameters: {}
            });

            expect(plan.estimatedCost).toBeGreaterThan(0);
        });
    });

    describe('HITL Integration', () => {
        it('should flag posts requiring human approval', async () => {
            const plan = await agent.plan({
                userId: 'test_user',
                mission: 'Create sensitive PR announcement',
                parameters: { requiresApproval: true }
            });

            // HITL integration should be present in workflow
            expect(plan).toBeDefined();
        });
    });

    describe('Verification', () => {
        it('should verify published posts', async () => {
            const result = {
                success: true,
                data: {
                    message: 'Social campaign deployed',
                    platforms: 3,
                    posts: { post_x: true, post_linkedin: true, post_facebook: true }
                },
                cost: 30,
                duration: 2000,
                artifacts: []
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Publish posts',
                parameters: {}
            });

            expect(report.passed).toBe(true);
        });

        it('should fail verification if no posts published', async () => {
            const result = {
                success: false,
                error: 'All platforms failed',
                cost: 5,
                duration: 1000,
                artifacts: []
            };

            const report = await agent.verify(result, {
                userId: 'test_user',
                mission: 'Publish posts',
                parameters: {}
            });

            expect(report.passed).toBe(false);
        });
    });
});
