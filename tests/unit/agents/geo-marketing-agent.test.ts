/**
 * Geo Marketing Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Geo marketing strategy' },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

import { GeoMarketingAgent } from '@/agents/geo-marketing-agent';
import type { AgentContext } from '@/agents/base';

describe('GeoMarketingAgent', () => {
  let agent: GeoMarketingAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new GeoMarketingAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('geo-marketing-agent');
    });

    it('should have GEO marketing capabilities', () => {
      expect(agent.capabilities).toContain('citation_vector_analysis');
      expect(agent.capabilities).toContain('authority_scoring');
      expect(agent.capabilities).toContain('geo_content_optimization');
      expect(agent.capabilities).toContain('llm_visibility_audit');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('gemini_3_flash');
      expect(agent.requiredSkills).toContain('deep_research');
      expect(agent.requiredSkills).toContain('geo_citation_analyzer');
    });
  });

  describe('Planning', () => {
    it('should create geo marketing plan', async () => {
      const context: AgentContext = {
        mission: 'Optimise local SEO for Sydney restaurant',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.requiredSkills).toEqual(agent.requiredSkills);
    });

    it('should handle Australian location focus', async () => {
      const context: AgentContext = {
        mission: 'Target Melbourne area customers',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      expect(plan.reasoning).toBeDefined();
    });

    it('should estimate cost', async () => {
      const context: AgentContext = { mission: 'Local marketing', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Execution', () => {
    it('should execute geo marketing tasks', async () => {
      const context: AgentContext = {
        mission: 'Update Google Business Profile',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
    });

    it('should produce marketing artifacts', async () => {
      const context: AgentContext = { mission: 'Create local campaign', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.artifacts).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify marketing execution', async () => {
      const context: AgentContext = { mission: 'Local SEO audit', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
    });

    it('should check location targeting', async () => {
      const context: AgentContext = { mission: 'Target Brisbane suburbs', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.checks.length).toBeGreaterThan(0);
    });
  });
});
