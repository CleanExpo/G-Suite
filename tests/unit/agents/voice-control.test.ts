/**
 * Voice Control Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            id: 'session-123',
            commands: [
                {
                    transcript: 'Check my calendar for today',
                    intent: 'calendar_check',
                    entities: { date: 'today' },
                    confidence: 0.95,
                    action: 'fetch_calendar'
                }
            ],
            responses: [
                {
                    text: 'You have 3 meetings scheduled for today.',
                    ssml: '<speak>You have 3 meetings scheduled for today.</speak>'
                }
            ],
            context: { lastIntent: 'calendar_check' },
            active: true,
            command: null,
            response: { text: 'Processed' }
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

import { VoiceControlAgent } from '@/agents/voice-control';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('VoiceControlAgent', () => {
    let agent: VoiceControlAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new VoiceControlAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Check my calendar for today',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('voice-control');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('speech_recognition');
            expect(agent.capabilities).toContain('intent_detection');
            expect(agent.capabilities).toContain('voice_synthesis');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('speech_to_text');
            expect(agent.requiredSkills).toContain('text_to_speech');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should include transcribe step', async () => {
            const plan = await agent.plan(mockContext);

            const transcribeStep = plan.steps.find(s => s.id === 'transcribe');
            expect(transcribeStep).toBeDefined();
        });

        it('should include respond step', async () => {
            const plan = await agent.plan(mockContext);

            const respondStep = plan.steps.find(s => s.id === 'respond');
            expect(respondStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'transcribe', action: 'Transcribe voice', tool: 'speech_to_text', payload: {} },
                    { id: 'parse', action: 'Parse intent', tool: 'intent_classifier', payload: {} },
                    { id: 'respond', action: 'Generate response', tool: 'text_to_speech', payload: {} }
                ],
                estimatedCost: 50,
                requiredSkills: ['speech_to_text'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return voice session', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.session).toBeDefined();
        });

        it('should produce artifacts', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.artifacts).toBeDefined();
            expect(result.artifacts!.length).toBeGreaterThan(0);
        });
    });

    describe('verify()', () => {
        it('should pass verification with valid session', async () => {
            const mockResult = {
                success: true,
                data: {
                    session: {
                        id: 'test',
                        commands: [{ transcript: 'test', intent: 'test', entities: {}, confidence: 0.9, action: 'test' }],
                        responses: [{ text: 'Response' }],
                        context: {},
                        active: true
                    }
                },
                cost: 50,
                duration: 2000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should fail verification with no responses', async () => {
            const mockResult = {
                success: true,
                data: {
                    session: {
                        id: 'test',
                        commands: [],
                        responses: [],
                        context: {},
                        active: false
                    }
                },
                cost: 50,
                duration: 2000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Microphone unavailable',
                cost: 0,
                duration: 500
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
