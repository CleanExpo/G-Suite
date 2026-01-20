// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            dossiers: [
                                {
                                    agentName: 'test-agent',
                                    source: 'github',
                                    compatibilityScore: 0.85,
                                    securityRating: 'A'
                                }
                            ]
                        }),
                        usageMetadata: { totalTokenCount: 100 }
                    }
                })
            };
        }
    }
}));

// Mock the Agent Discovery Skill
vi.mock('@/tools/agentDiscoverySkill', () => ({
    agent_discovery: vi.fn().mockResolvedValue({
        success: true,
        dossiers: [
            {
                agentName: 'test-agent',
                source: 'github',
                compatibilityScore: 0.85,
                securityRating: 'A',
                uniqueCapabilities: ['automation'],
                fuelCostEstimate: '100 PTS'
            }
        ]
    }),
    INTELLIGENCE_SOURCES: ['github', 'huggingface', 'langchain_hub']
}));

// Import after mocking
import { AgentScoutAgent } from '@/agents/agent-scout';

describe('AgentScoutAgent', () => {
    let agent: AgentScoutAgent;

    beforeEach(() => {
        agent = new AgentScoutAgent();
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('agent-scout');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('agent_discovery');
            expect(agent.capabilities).toContain('compatibility_analysis');
            expect(agent.capabilities).toContain('security_audit');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('web_intel');
            expect(agent.requiredSkills).toContain('agent_discovery');
        });
    });

    describe('Planning', () => {
        it('should create a plan for quick_scan mission', async () => {
            const context = {
                userId: 'test-user',
                mission: 'Quick scan for automation agents'
            };

            const plan = await agent.plan(context);

            expect(plan).toBeDefined();
            expect(plan.steps).toBeDefined();
            expect(plan.estimatedCost).toBeGreaterThan(0);
            expect(plan.requiredSkills).toEqual(agent.requiredSkills);
        });

        it('should detect deep_recon mission type', async () => {
            const context = {
                userId: 'test-user',
                mission: 'Deep analysis of the AI agent ecosystem'
            };

            const plan = await agent.plan(context);

            expect(plan.estimatedCost).toBeGreaterThan(50); // Deep recon costs more
        });
    });

    describe('Execution', () => {
        it('should execute a scouting mission', async () => {
            const context = {
                userId: 'test-user',
                mission: 'Find marketing automation agents'
            };

            const plan = await agent.plan(context);
            const result = await agent.execute(plan, context);

            expect(result.success).toBe(true);
            expect(result.artifacts).toBeDefined();
            expect(result.duration).toBeGreaterThan(0);
        });
    });

    describe('Verification', () => {
        it('should verify successful results', async () => {
            const mockResult = {
                success: true,
                data: {
                    discovered: 5,
                    recommended: 2,
                    securityAuditPassed: true
                },
                cost: 50,
                duration: 1000,
                artifacts: [
                    { type: 'data' as const, name: 'scout_report', value: {} },
                    { type: 'data' as const, name: 'intelligence_brief', value: {} },
                    { type: 'data' as const, name: 'recommended_agents', value: {} }
                ]
            };

            const context = {
                userId: 'test-user',
                mission: 'Test mission'
            };

            const report = await agent.verify(mockResult, context);

            expect(report.passed).toBe(true);
            expect(report.checks).toBeDefined();
        });
    });
});
