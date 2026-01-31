/**
 * Refactor Specialist Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Refactored code' },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

import { RefactorSpecialistAgent } from '@/agents/refactor-specialist';
import type { AgentContext } from '@/agents/base';

describe('RefactorSpecialistAgent', () => {
  let agent: RefactorSpecialistAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new RefactorSpecialistAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('refactor-specialist');
    });

    it('should have refactoring capabilities', () => {
      expect(agent.capabilities).toContain('code_cleanup');
      expect(agent.capabilities).toContain('pattern_migration');
      expect(agent.capabilities).toContain('reduce_complexity');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('refactoring');
      expect(agent.requiredSkills).toContain('design_patterns');
    });
  });

  describe('Planning', () => {
    it('should create refactoring plan', async () => {
      const context: AgentContext = { mission: 'Refactor the user module', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(2);
      expect(plan.steps.some(s => s.id === 'analyse_code')).toBe(true);
      expect(plan.steps.some(s => s.id === 'execute_refactor')).toBe(true);
    });

    it('should include behaviour verification', async () => {
      const context: AgentContext = { mission: 'Refactor code', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'verify_behaviour')).toBe(true);
    });
  });

  describe('Execution', () => {
    it('should execute refactoring', async () => {
      const context: AgentContext = { mission: 'Refactor', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.some(a => a.name === 'refactor_summary')).toBe(true);
    });
  });

  describe('Verification', () => {
    it('should verify refactoring', async () => {
      const context: AgentContext = { mission: 'Refactor', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Behaviour Preserved')).toBe(true);
    });
  });
});
