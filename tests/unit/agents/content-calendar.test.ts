/**
 * Content Calendar Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            items: [
                {
                    id: 'content-1',
                    title: 'Weekly Newsletter',
                    type: 'email',
                    status: 'scheduled',
                    scheduledDate: '2025-02-15',
                    channels: ['email'],
                    tags: ['newsletter', 'weekly']
                }
            ],
            upcoming: [],
            overdue: [],
            gaps: ['No content scheduled for weekend'],
            recommendations: ['Add social media posts for better engagement'],
            insights: ['Content frequency is optimal']
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

import { ContentCalendarAgent } from '@/agents/content-calendar';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('ContentCalendarAgent', () => {
    let agent: ContentCalendarAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new ContentCalendarAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Review content calendar for February 2025',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('content-calendar');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('calendar_management');
            expect(agent.capabilities).toContain('content_scheduling');
            expect(agent.capabilities).toContain('gap_analysis');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('calendar_api');
            expect(agent.requiredSkills).toContain('content_management');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
            expect(plan.reasoning).toBeDefined();
        });

        it('should include fetch step', async () => {
            const plan = await agent.plan(mockContext);

            const fetchStep = plan.steps.find(s => s.id === 'fetch');
            expect(fetchStep).toBeDefined();
            expect(fetchStep?.tool).toBe('calendar_api');
        });

        it('should include analyse step', async () => {
            const plan = await agent.plan(mockContext);

            const analyseStep = plan.steps.find(s => s.id === 'analyse');
            expect(analyseStep).toBeDefined();
        });

        it('should include report step', async () => {
            const plan = await agent.plan(mockContext);

            const reportStep = plan.steps.find(s => s.id === 'report');
            expect(reportStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'fetch', action: 'Fetch calendar', tool: 'calendar_api', payload: {} },
                    { id: 'analyse', action: 'Analyse gaps', tool: 'gemini_3_flash', payload: {} },
                    { id: 'report', action: 'Generate report', tool: 'gemini_3_flash', payload: {} }
                ],
                estimatedCost: 80,
                requiredSkills: ['calendar_api'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return calendar view', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.calendar).toBeDefined();
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
        it('should pass verification with valid calendar', async () => {
            const mockResult = {
                success: true,
                data: {
                    calendar: {
                        items: [{ id: '1', title: 'Test', type: 'blog' as const, status: 'scheduled' as const, scheduledDate: '2025-02-15', channels: [], tags: [] }],
                        upcoming: [],
                        overdue: [],
                        gaps: ['Weekend gap'],
                        recommendations: ['Add more content']
                    }
                },
                cost: 80,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
            expect(report.checks.length).toBeGreaterThan(0);
        });

        it('should pass verification with empty calendar', async () => {
            const mockResult = {
                success: true,
                data: {
                    calendar: {
                        items: [],
                        upcoming: [],
                        overdue: [],
                        gaps: [],
                        recommendations: ['Start adding content']
                    }
                },
                cost: 80,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Calendar API unavailable',
                cost: 0,
                duration: 1000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
