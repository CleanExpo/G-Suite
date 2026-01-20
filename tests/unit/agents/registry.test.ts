// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => '{}',
                        usageMetadata: { totalTokenCount: 0 }
                    }
                })
            };
        }
    }
}));

import { AgentRegistry, initializeAgents } from '@/agents/registry';

describe('AgentRegistry', () => {
    beforeEach(() => {
        // Clear registry between tests
        AgentRegistry['agents'].clear();
        AgentRegistry['constructors'].clear();
    });

    describe('Agent Registration', () => {
        it('should register an agent instance', () => {
            const mockAgent = {
                name: 'test-agent',
                description: 'Test agent',
                capabilities: ['test'],
                requiredSkills: ['test-skill'],
                plan: vi.fn(),
                execute: vi.fn(),
                verify: vi.fn()
            };

            AgentRegistry.register(mockAgent as any);

            expect(AgentRegistry.has('test-agent')).toBe(true);
        });

        it('should get a registered agent', () => {
            const mockAgent = {
                name: 'get-test-agent',
                description: 'Test agent',
                capabilities: ['test'],
                requiredSkills: ['test-skill'],
                plan: vi.fn(),
                execute: vi.fn(),
                verify: vi.fn()
            };

            AgentRegistry.register(mockAgent as any);
            const retrieved = AgentRegistry.get('get-test-agent');

            expect(retrieved).toBeDefined();
            expect(retrieved?.name).toBe('get-test-agent');
        });

        it('should return undefined for non-existent agent', () => {
            const agent = AgentRegistry.get('non-existent');
            expect(agent).toBeUndefined();
        });
    });

    describe('Available Agents', () => {
        it('should list all available agents', () => {
            const mockAgent1 = {
                name: 'agent-1',
                description: 'Agent 1',
                capabilities: [],
                requiredSkills: [],
                plan: vi.fn(),
                execute: vi.fn(),
                verify: vi.fn()
            };

            const mockAgent2 = {
                name: 'agent-2',
                description: 'Agent 2',
                capabilities: [],
                requiredSkills: [],
                plan: vi.fn(),
                execute: vi.fn(),
                verify: vi.fn()
            };

            AgentRegistry.register(mockAgent1 as any);
            AgentRegistry.register(mockAgent2 as any);

            const available = AgentRegistry.getAvailableAgents();

            expect(available).toContain('agent-1');
            expect(available).toContain('agent-2');
        });
    });

    describe('Initialize Agents', () => {
        it('should initialize core agents', async () => {
            await initializeAgents();

            const available = AgentRegistry.getAvailableAgents();

            // Should have core agents registered
            expect(available.length).toBeGreaterThan(0);
        });
    });
});
