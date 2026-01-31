/**
 * Bug Hunter Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Google AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Bug analysis and fix',
    },
    usageMetadata: {
      promptTokenCount: 150,
      candidatesTokenCount: 250,
      totalTokenCount: 400,
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

import { BugHunterAgent } from '@/agents/bug-hunter';
import type { AgentContext } from '@/agents/base';

describe('BugHunterAgent', () => {
  let agent: BugHunterAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new BugHunterAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('bug-hunter');
    });

    it('should have debugging capabilities', () => {
      expect(agent.capabilities).toContain('root_cause_analysis');
      expect(agent.capabilities).toContain('bug_reproduction');
      expect(agent.capabilities).toContain('fix_implementation');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('debugging');
      expect(agent.requiredSkills).toContain('testing');
      expect(agent.requiredSkills).toContain('logging');
    });
  });

  describe('Planning', () => {
    it('should create bug investigation plan', async () => {
      const context: AgentContext = {
        mission: 'Fix the login button not working',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(3);
      expect(plan.steps.some(s => s.id === 'gather_info')).toBe(true);
      expect(plan.steps.some(s => s.id === 'reproduce_bug')).toBe(true);
    });

    it('should include regression test step', async () => {
      const context: AgentContext = {
        mission: 'Fix bug',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const regressionStep = plan.steps.find(s => s.id === 'write_regression_test');
      expect(regressionStep).toBeDefined();
    });

    it('should include fix verification step', async () => {
      const context: AgentContext = {
        mission: 'Fix bug',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const verifyStep = plan.steps.find(s => s.id === 'verify_fix');
      expect(verifyStep).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should analyse and fix bug', async () => {
      const context: AgentContext = {
        mission: 'Fix the crash on page load',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should include bug analysis in artifacts', async () => {
      const context: AgentContext = {
        mission: 'Fix bug',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      const analysis = result.artifacts?.find(a => a.name === 'bug_analysis');
      expect(analysis).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify bug fix completion', async () => {
      const context: AgentContext = {
        mission: 'Fix bug',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Regression Test')).toBe(true);
    });
  });
});
