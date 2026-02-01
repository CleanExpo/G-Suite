/**
 * Visual Builder Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            blueprint: {
                id: 'agent-123',
                name: 'Custom Agent',
                description: 'A custom-built agent',
                blocks: [
                    { id: 'trigger-1', type: 'trigger', name: 'On Schedule', config: { cron: '0 9 * * *' }, connections: ['action-1'] },
                    { id: 'action-1', type: 'action', name: 'Fetch Data', config: {}, connections: ['output-1'] },
                    { id: 'output-1', type: 'output', name: 'Send Report', config: {}, connections: [] }
                ],
                version: '1.0.0',
                createdAt: '2025-02-01T10:00:00Z',
                valid: true
            },
            validation: { valid: true, errors: [] },
            preview: 'Agent runs daily at 9am, fetches data, and sends report',
            blocks: [],
            connections: []
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

import { VisualBuilderAgent } from '@/agents/visual-builder';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('VisualBuilderAgent', () => {
    let agent: VisualBuilderAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new VisualBuilderAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Build an agent that monitors website uptime and alerts on failures',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('visual-builder');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('agent_design');
            expect(agent.capabilities).toContain('workflow_builder');
            expect(agent.capabilities).toContain('validation');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('agent_registry');
            expect(agent.requiredSkills).toContain('workflow_engine');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
            expect(plan.reasoning).toBeDefined();
        });

        it('should include parse step', async () => {
            const plan = await agent.plan(mockContext);

            const parseStep = plan.steps.find(s => s.id === 'parse');
            expect(parseStep).toBeDefined();
        });

        it('should include validate step', async () => {
            const plan = await agent.plan(mockContext);

            const validateStep = plan.steps.find(s => s.id === 'validate');
            expect(validateStep).toBeDefined();
        });

        it('should include generate step', async () => {
            const plan = await agent.plan(mockContext);

            const generateStep = plan.steps.find(s => s.id === 'generate');
            expect(generateStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'parse', action: 'Parse requirements', tool: 'gemini_3_flash', payload: {} },
                    { id: 'design', action: 'Design workflow', tool: 'workflow_engine', payload: {} },
                    { id: 'validate', action: 'Validate blueprint', tool: 'agent_validator', payload: {} }
                ],
                estimatedCost: 100,
                requiredSkills: ['workflow_engine'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThanOrEqual(0);
        });

        it('should return builder result', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.result).toBeDefined();
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
        it('should pass verification with valid blueprint', async () => {
            const mockResult = {
                success: true,
                data: {
                    result: {
                        blueprint: {
                            id: 'test',
                            name: 'Test Agent',
                            description: 'Test',
                            blocks: [{ id: '1', type: 'trigger' as const, name: 'Start', config: {}, connections: [] }],
                            version: '1.0.0',
                            createdAt: '2025-02-01',
                            valid: true
                        },
                        validation: { valid: true, errors: [] },
                        preview: 'Test preview'
                    }
                },
                cost: 100,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
            expect(report.checks.length).toBeGreaterThan(0);
        });

        it('should fail verification with invalid blueprint', async () => {
            const mockResult = {
                success: true,
                data: {
                    result: {
                        blueprint: {
                            id: 'test',
                            name: 'Test',
                            description: 'Test',
                            blocks: [],
                            version: '1.0.0',
                            createdAt: '2025-02-01',
                            valid: false
                        },
                        validation: { valid: false, errors: ['No blocks defined'] },
                        preview: ''
                    }
                },
                cost: 100,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Builder failed',
                cost: 0,
                duration: 1000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
