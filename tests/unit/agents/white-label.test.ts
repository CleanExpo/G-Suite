/**
 * White-Label Platform Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            tenants: [
                {
                    id: 'tenant-1',
                    name: 'Acme Corp',
                    domain: 'acme.example.com',
                    branding: { logo: 'acme-logo.png', primaryColour: '#007bff', secondaryColour: '#6c757d' },
                    features: ['analytics', 'reporting'],
                    active: true
                }
            ],
            deployments: [
                { tenantId: 'tenant-1', environment: 'production', version: '2.1.0', status: 'deployed', lastDeploy: '2025-02-01T10:00:00Z' }
            ],
            activeUsers: 250,
            healthScore: 95,
            insights: ['All tenants healthy', 'Consider scaling infrastructure'],
            metrics: {}
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

import { WhiteLabelAgent } from '@/agents/white-label';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('WhiteLabelAgent', () => {
    let agent: WhiteLabelAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new WhiteLabelAgent();
        mockContext = {
            userId: 'admin',
            mission: 'Check platform status and tenant health',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('white-label');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('tenant_management');
            expect(agent.capabilities).toContain('branding_customisation');
            expect(agent.capabilities).toContain('deployment_orchestration');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('tenant_api');
            expect(agent.requiredSkills).toContain('deployment_pipeline');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(3);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should include tenants step', async () => {
            const plan = await agent.plan(mockContext);

            const tenantsStep = plan.steps.find(s => s.id === 'tenants');
            expect(tenantsStep).toBeDefined();
        });

        it('should include deployments step', async () => {
            const plan = await agent.plan(mockContext);

            const deploymentsStep = plan.steps.find(s => s.id === 'deployments');
            expect(deploymentsStep).toBeDefined();
        });

        it('should include health step', async () => {
            const plan = await agent.plan(mockContext);

            const healthStep = plan.steps.find(s => s.id === 'health');
            expect(healthStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'tenants', action: 'Fetch tenants', tool: 'tenant_api', payload: {} },
                    { id: 'deployments', action: 'Check deployments', tool: 'deployment_pipeline', payload: {} },
                    { id: 'health', action: 'Calculate health', tool: 'gemini_3_flash', payload: {} }
                ],
                estimatedCost: 80,
                requiredSkills: ['tenant_api'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return platform dashboard', async () => {
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
        it('should pass verification with healthy platform', async () => {
            const mockResult = {
                success: true,
                data: {
                    dashboard: {
                        tenants: [{ id: '1', name: 'Test', domain: 'test.com', branding: { logo: '', primaryColour: '', secondaryColour: '' }, features: [], active: true }],
                        deployments: [{ tenantId: '1', environment: 'production' as const, version: '1.0', status: 'deployed' as const, lastDeploy: '2025-02-01' }],
                        activeUsers: 100,
                        healthScore: 95,
                        insights: ['All healthy']
                    }
                },
                cost: 80,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should flag low health score in checks', async () => {
            const mockResult = {
                success: true,
                data: {
                    dashboard: {
                        tenants: [],
                        deployments: [],
                        activeUsers: 0,
                        healthScore: 50,
                        insights: ['Platform degraded']
                    }
                },
                cost: 80,
                duration: 3000
            };

            const report = await agent.verify(mockResult, mockContext);

            // Overall passes because success=true, but health check should fail
            const healthCheck = report.checks.find(c => c.name === 'Platform Health');
            expect(healthCheck?.passed).toBe(false);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Tenant API unavailable',
                cost: 0,
                duration: 500
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});
