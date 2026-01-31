/**
 * Code Reviewer Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Review feedback' },
          usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 250, totalTokenCount: 400 },
        }),
      };
    }
  },
}));

import { CodeReviewerAgent } from '@/agents/code-reviewer';
import type { AgentContext } from '@/agents/base';

describe('CodeReviewerAgent', () => {
  let agent: CodeReviewerAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new CodeReviewerAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('code-reviewer');
    });

    it('should have code review capabilities', () => {
      expect(agent.capabilities).toContain('pr_review');
      expect(agent.capabilities).toContain('best_practices');
      expect(agent.capabilities).toContain('security_review');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('code_review');
      expect(agent.requiredSkills).toContain('design_patterns');
    });
  });

  describe('Planning', () => {
    it('should create review plan', async () => {
      const context: AgentContext = { mission: 'Review pull request', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(3);
      expect(plan.steps.some(s => s.id === 'check_logic')).toBe(true);
      expect(plan.steps.some(s => s.id === 'check_security')).toBe(true);
    });

    it('should include performance review', async () => {
      const context: AgentContext = { mission: 'Code review', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'check_performance')).toBe(true);
    });
  });

  describe('Execution', () => {
    it('should produce review feedback', async () => {
      const context: AgentContext = { mission: 'Review code', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.some(a => a.name === 'review_summary')).toBe(true);
    });
  });

  describe('Verification', () => {
    it('should verify review completion', async () => {
      const context: AgentContext = { mission: 'Review', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Security')).toBe(true);
    });
  });
});
