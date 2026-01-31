/**
 * Mobile Bridge Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            devices: [
                { id: 'device-1', platform: 'ios', version: '17.0', lastSeen: '2025-02-01T10:00:00Z' },
                { id: 'device-2', platform: 'android', version: '14', lastSeen: '2025-02-01T09:00:00Z' }
            ],
            notifications: [
                { id: 'notif-1', title: 'Task Complete', body: 'Your analysis is ready', data: {}, sent: true }
            ],
            syncStatus: 'synced',
            lastSync: '2025-02-01T10:30:00Z'
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

import { MobileBridgeAgent } from '@/agents/mobile-bridge';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('MobileBridgeAgent', () => {
    let agent: MobileBridgeAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new MobileBridgeAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Sync data and send notifications to mobile devices',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('mobile-bridge');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('device_registration');
            expect(agent.capabilities).toContain('push_notifications');
            expect(agent.capabilities).toContain('offline_sync');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('firebase_cloud_messaging');
            expect(agent.requiredSkills).toContain('device_sync');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should include devices step', async () => {
            const plan = await agent.plan(mockContext);

            const devicesStep = plan.steps.find(s => s.id === 'devices');
            expect(devicesStep).toBeDefined();
        });

        it('should include sync step', async () => {
            const plan = await agent.plan(mockContext);

            const syncStep = plan.steps.find(s => s.id === 'sync');
            expect(syncStep).toBeDefined();
        });

        it('should include notify step', async () => {
            const plan = await agent.plan(mockContext);

            const notifyStep = plan.steps.find(s => s.id === 'notify');
            expect(notifyStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'devices', action: 'Fetch devices', tool: 'device_registry', payload: {} },
                    { id: 'sync', action: 'Sync data', tool: 'device_sync', payload: {} },
                    { id: 'notify', action: 'Send notifications', tool: 'push_service', payload: {} }
                ],
                estimatedCost: 60,
                requiredSkills: ['device_sync'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return mobile session', async () => {
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
        it('should pass verification with synced session', async () => {
            const mockResult = {
                success: true,
                data: {
                    session: {
                        devices: [{ id: '1', platform: 'ios' as const, version: '17', lastSeen: '2025-02-01' }],
                        notifications: [],
                        syncStatus: 'synced' as const,
                        lastSync: '2025-02-01'
                    }
                },
                cost: 60,
                duration: 2000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Push service unavailable',
                cost: 0,
                duration: 500
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
