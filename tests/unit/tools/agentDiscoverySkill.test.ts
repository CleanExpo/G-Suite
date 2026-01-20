// Mock fetch for API calls
global.fetch = vi.fn();

// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            agents: [
                                {
                                    agentName: 'discovered-agent',
                                    source: 'langchain_hub',
                                    compatibilityScore: 0.8,
                                    securityRating: 'B',
                                    uniqueCapabilities: ['task automation'],
                                    integrationEstimate: '2-3 days'
                                }
                            ]
                        }),
                        usageMetadata: { totalTokenCount: 200 }
                    }
                })
            };
        }
    }
}));

import { agent_discovery, check_compatibility } from '@/tools/agentDiscoverySkill';

describe('Agent Discovery Skill', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock GitHub API response
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                items: [
                    {
                        full_name: 'test/agent-repo',
                        description: 'A test agent built with TypeScript and LangChain for automation',
                        stargazers_count: 5000,
                        updated_at: new Date().toISOString(),
                        license: { spdx_id: 'MIT' },
                        owner: { login: 'testuser' },
                        html_url: 'https://github.com/test/agent-repo',
                        topics: ['ai-agent', 'automation']
                    }
                ]
            })
        });
    });

    describe('agent_discovery', () => {
        it('should discover agents from GitHub', async () => {
            const result = await agent_discovery('test-user', 'automation agent', {
                sources: ['github'],
                limit: 5
            });

            expect(result.success).toBe(true);
            expect(result.dossiers).toBeDefined();
            expect(result.sourcesScanned).toContain('github');
        });

        it('should filter by minimum compatibility', async () => {
            const result = await agent_discovery('test-user', 'marketing agent', {
                sources: ['github'],
                minCompatibility: 0.7
            });

            expect(result.success).toBe(true);
            // All returned dossiers should meet minimum compatibility
            result.dossiers.forEach(dossier => {
                expect(dossier.compatibilityScore).toBeGreaterThanOrEqual(0.7);
            });
        });

        it('should scan multiple sources', async () => {
            const result = await agent_discovery('test-user', 'data processing', {
                sources: ['github', 'huggingface', 'langchain_hub']
            });

            expect(result.success).toBe(true);
            expect(result.sourcesScanned.length).toBeGreaterThan(1);
        });
    });

    describe('check_compatibility', () => {
        it('should check compatibility of a dossier', async () => {
            const mockDossier = {
                agentName: 'test-agent',
                source: 'github' as const,
                sourceUrl: 'https://github.com/test/repo',
                description: 'Test agent',
                compatibilityScore: 0.85,
                securityRating: 'A' as const,
                uniqueCapabilities: ['task automation'],
                requiredDependencies: ['node'],
                integrationEstimate: '1-2 days',
                fuelCostEstimate: '50-100 PTS',
                lastUpdated: new Date().toISOString(),
                stars: 1000,
                maintainer: 'testuser',
                license: 'MIT'
            };

            const result = await check_compatibility('test-user', mockDossier);

            expect(result.success).toBe(true);
            expect(result.checks).toBeDefined();
            expect(result.score).toBeGreaterThan(0);
        });

        it('should flag agents with low security rating', async () => {
            const lowSecurityDossier = {
                agentName: 'risky-agent',
                source: 'github' as const,
                sourceUrl: 'https://github.com/unknown/repo',
                description: 'Unknown agent',
                compatibilityScore: 0.4,
                securityRating: 'D' as const,
                uniqueCapabilities: [],
                requiredDependencies: [],
                integrationEstimate: '2+ weeks',
                fuelCostEstimate: '500+ PTS',
                lastUpdated: '2020-01-01',
                stars: 5,
                maintainer: 'unknown',
                license: 'unknown'
            };

            const result = await check_compatibility('test-user', lowSecurityDossier);

            expect(result.recommendation).not.toBe('integrate');
        });
    });
});
