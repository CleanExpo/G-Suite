/**
 * CRM Hub Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            totalContacts: 1250,
            activePipelines: 3,
            syncStatus: [
                {
                    platform: 'hubspot',
                    contactsSynced: 500,
                    dealsUpdated: 25,
                    errors: [],
                    lastSync: '2025-02-01T10:00:00Z'
                }
            ],
            insights: ['Pipeline velocity increased 15%', 'Lead quality improving'],
            recommendations: ['Focus on enterprise segment', 'Automate follow-ups'],
            contacts: [],
            pipelines: [],
            syncResults: {}
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

import { CRMHubAgent } from '@/agents/crm-hub';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('CRMHubAgent', () => {
    let agent: CRMHubAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new CRMHubAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Sync HubSpot and Salesforce CRM data',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('crm-hub');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('contact_sync');
            expect(agent.capabilities).toContain('pipeline_management');
            expect(agent.capabilities).toContain('multi_platform_sync');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('hubspot_api');
            expect(agent.requiredSkills).toContain('salesforce_api');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
            expect(plan.reasoning).toBeDefined();
        });

        it('should include connect step', async () => {
            const plan = await agent.plan(mockContext);

            const connectStep = plan.steps.find(s => s.id === 'connect');
            expect(connectStep).toBeDefined();
        });

        it('should include sync step', async () => {
            const plan = await agent.plan(mockContext);

            const syncStep = plan.steps.find(s => s.id === 'sync');
            expect(syncStep).toBeDefined();
        });

        it('should detect platforms from mission', async () => {
            const plan = await agent.plan(mockContext);

            const connectStep = plan.steps.find(s => s.id === 'connect');
            const platforms = (connectStep?.payload as Record<string, unknown>)?.platforms as string[];
            expect(platforms).toContain('hubspot');
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'connect', action: 'Connect to CRM', tool: 'crm_connector', payload: {} },
                    { id: 'sync', action: 'Sync data', tool: 'data_sync', payload: {} },
                    { id: 'report', action: 'Generate report', tool: 'gemini_3_flash', payload: {} }
                ],
                estimatedCost: 120,
                requiredSkills: ['hubspot_api'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return CRM dashboard', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.dashboard).toBeDefined();
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
        it('should pass verification with valid dashboard', async () => {
            const mockResult = {
                success: true,
                data: {
                    dashboard: {
                        totalContacts: 1000,
                        activePipelines: 2,
                        syncStatus: [{ platform: 'hubspot', contactsSynced: 500, dealsUpdated: 10, errors: [], lastSync: '2025-02-01' }],
                        insights: ['Growth detected'],
                        recommendations: ['Scale outreach']
                    }
                },
                cost: 120,
                duration: 5000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
            expect(report.checks.length).toBeGreaterThan(0);
        });

        it('should pass with empty contacts', async () => {
            const mockResult = {
                success: true,
                data: {
                    dashboard: {
                        totalContacts: 0,
                        activePipelines: 0,
                        syncStatus: [],
                        insights: ['No data yet'],
                        recommendations: ['Import contacts']
                    }
                },
                cost: 120,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'CRM API unavailable',
                cost: 0,
                duration: 1000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
