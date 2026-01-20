// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => JSON.stringify({
                            domain: 'marketing',
                            intent: 'Create marketing campaign',
                            complexity: 'moderate'
                        }),
                        usageMetadata: { totalTokenCount: 100 }
                    }
                })
            };
        }
    }
}));

// Import after mocking
import { GenesisArchitectAgent } from '@/agents/genesis-architect';

describe('GenesisArchitectAgent', () => {
    let agent: GenesisArchitectAgent;

    beforeEach(() => {
        agent = new GenesisArchitectAgent();
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('genesis-architect');
        });

        it('should have deep understanding capability', () => {
            expect(agent.capabilities).toContain('deep_understanding');
            expect(agent.capabilities).toContain('capability_discovery');
            expect(agent.capabilities).toContain('agent_generation');
        });

        it('should have required skills', () => {
            // Genesis uses and creates skills dynamically, so requiredSkills is empty
            expect(agent.requiredSkills.length).toBe(0);
        });
    });

    describe('Planning', () => {
        it('should create a comprehensive plan', async () => {
            const context = {
                userId: 'test-user',
                mission: 'Create a marketing campaign for a new product launch'
            };

            const plan = await agent.plan(context);

            expect(plan).toBeDefined();
            expect(plan.steps).toBeDefined();
            expect(plan.reasoning).toBeDefined();
        });
    });

    describe('Domain Detection', () => {
        it('should detect marketing domain', async () => {
            const context = {
                userId: 'test-user',
                mission: 'Create social media marketing strategy'
            };

            const plan = await agent.plan(context);

            // Plan should involve marketing-related steps
            expect(plan.reasoning?.toLowerCase()).toContain('marketing');
        });

        it('should detect research domain', async () => {
            const context = {
                userId: 'test-user',
                mission: 'Research competitor analysis'
            };

            const plan = await agent.plan(context);
            expect(plan).toBeDefined();
        });
    });
});
