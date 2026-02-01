/**
 * Email Marketing Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            campaigns: [
                {
                    id: 'campaign-1',
                    name: 'Newsletter Q1',
                    subject: 'Your Monthly Update',
                    content: 'Hello, here is your monthly update...',
                    audience: ['subscribers', 'active-users'],
                    status: 'scheduled',
                    metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, openRate: 0, clickRate: 0 }
                }
            ],
            templates: [
                { id: 'tpl-1', name: 'Newsletter', html: '<html>...</html>', variables: ['name', 'date'], category: 'marketing' }
            ],
            totalSent: 15000,
            avgOpenRate: 24.5,
            avgClickRate: 3.2,
            insights: ['Best send time is Tuesday 10am', 'Subject lines with emojis perform 15% better'],
            recommendations: ['A/B test subject lines', 'Segment inactive users'],
            subject: 'Test Subject',
            content: 'Test content',
            audience: ['test']
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

import { EmailMarketingAgent } from '@/agents/email-marketing';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('EmailMarketingAgent', () => {
    let agent: EmailMarketingAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new EmailMarketingAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Create a newsletter campaign for Q1 product updates',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('email-marketing');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('campaign_creation');
            expect(agent.capabilities).toContain('template_management');
            expect(agent.capabilities).toContain('ab_testing');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('sendgrid_api');
            expect(agent.requiredSkills).toContain('mailchimp_api');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should include analyse step', async () => {
            const plan = await agent.plan(mockContext);

            const analyseStep = plan.steps.find(s => s.id === 'analyse');
            expect(analyseStep).toBeDefined();
        });

        it('should include content step', async () => {
            const plan = await agent.plan(mockContext);

            const contentStep = plan.steps.find(s => s.id === 'content');
            expect(contentStep).toBeDefined();
        });

        it('should include schedule step', async () => {
            const plan = await agent.plan(mockContext);

            const scheduleStep = plan.steps.find(s => s.id === 'schedule');
            expect(scheduleStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'analyse', action: 'Analyse requirements', tool: 'gemini_3_flash', payload: {} },
                    { id: 'content', action: 'Generate content', tool: 'gemini_3_flash', payload: {} },
                    { id: 'schedule', action: 'Schedule campaign', tool: 'esp_api', payload: {} }
                ],
                estimatedCost: 70,
                requiredSkills: ['sendgrid_api'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return email dashboard', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.dashboard).toBeDefined();
        });

        it('should produce artifacts', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.artifacts).toBeDefined();
            expect(result.artifacts!.length).toBeGreaterThan(0);
        });
    });

    describe('verify()', () => {
        it('should pass verification with valid dashboard', async () => {
            const mockResult = {
                success: true,
                data: {
                    dashboard: {
                        campaigns: [{ id: '1', name: 'Test', subject: 'Test', content: '', audience: [], status: 'draft' as const }],
                        templates: [],
                        totalSent: 1000,
                        avgOpenRate: 25,
                        avgClickRate: 3,
                        insights: ['Good performance'],
                        recommendations: ['Keep it up']
                    }
                },
                cost: 70,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'ESP API unavailable',
                cost: 0,
                duration: 500
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
