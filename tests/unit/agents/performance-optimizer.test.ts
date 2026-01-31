/**
 * Performance Optimizer Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Performance analysis' },
          usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 250, totalTokenCount: 400 },
        }),
      };
    }
  },
}));

import { PerformanceOptimizerAgent } from '@/agents/performance-optimizer';
import type { AgentContext } from '@/agents/base';

describe('PerformanceOptimizerAgent', () => {
  let agent: PerformanceOptimizerAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new PerformanceOptimizerAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('performance-optimizer');
    });

    it('should have performance capabilities', () => {
      expect(agent.capabilities).toContain('bundle_analysis');
      expect(agent.capabilities).toContain('core_web_vitals');
      expect(agent.capabilities).toContain('cache_strategy');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('profiling');
      expect(agent.requiredSkills).toContain('web_vitals');
    });
  });

  describe('Planning', () => {
    it('should create performance analysis plan', async () => {
      const context: AgentContext = { mission: 'Optimise performance', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(3);
      expect(plan.steps.some(s => s.id === 'bundle_analysis')).toBe(true);
      expect(plan.steps.some(s => s.id === 'web_vitals')).toBe(true);
    });

    it('should include cache audit', async () => {
      const context: AgentContext = { mission: 'Performance review', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'cache_audit')).toBe(true);
    });
  });

  describe('Execution', () => {
    it('should produce performance metrics', async () => {
      const context: AgentContext = { mission: 'Optimise', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.some(a => a.name === 'performance_metrics')).toBe(true);
    });
  });

  describe('Verification', () => {
    it('should verify performance targets', async () => {
      const context: AgentContext = { mission: 'Optimise', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'LCP')).toBe(true);
      expect(verification.checks.some(c => c.name === 'CLS')).toBe(true);
    });
  });
});
