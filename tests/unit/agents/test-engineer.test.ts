/**
 * Test Engineer Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Google AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Generated test code',
    },
    usageMetadata: {
      promptTokenCount: 100,
      candidatesTokenCount: 200,
      totalTokenCount: 300,
    },
  });

  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent: mockGenerateContent };
      }
    },
  };
});

import { TestEngineerAgent } from '@/agents/test-engineer';
import type { AgentContext } from '@/agents/base';

describe('TestEngineerAgent', () => {
  let agent: TestEngineerAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new TestEngineerAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('test-engineer');
    });

    it('should have testing capabilities', () => {
      expect(agent.capabilities).toContain('unit_testing');
      expect(agent.capabilities).toContain('integration_testing');
      expect(agent.capabilities).toContain('e2e_testing');
    });

    it('should have required testing skills', () => {
      expect(agent.requiredSkills).toContain('vitest');
      expect(agent.requiredSkills).toContain('playwright');
      expect(agent.requiredSkills).toContain('testing_library');
    });
  });

  describe('Planning', () => {
    it('should create unit test plan', async () => {
      const context: AgentContext = {
        mission: 'Write unit tests for the user service',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps.some(s => s.id === 'unit_tests')).toBe(true);
    });

    it('should create E2E test plan when requested', async () => {
      const context: AgentContext = {
        mission: 'Write end-to-end tests for the checkout flow',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'e2e_tests')).toBe(true);
    });

    it('should include coverage report step', async () => {
      const context: AgentContext = {
        mission: 'Write tests',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const coverageStep = plan.steps.find(s => s.id === 'coverage_report');
      expect(coverageStep).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should generate test code', async () => {
      const context: AgentContext = {
        mission: 'Write unit tests',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.some(a => a.type === 'code')).toBe(true);
    });
  });

  describe('Verification', () => {
    it('should verify test generation', async () => {
      const context: AgentContext = {
        mission: 'Write unit tests for the user service',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Tests Generated')).toBe(true);
    });
  });
});
