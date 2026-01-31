/**
 * Data Collector Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Data collection strategy' },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

import { DataCollectorAgent } from '@/agents/data-collector';
import type { AgentContext } from '@/agents/base';

describe('DataCollectorAgent', () => {
  let agent: DataCollectorAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new DataCollectorAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('data-collector');
    });

    it('should have data collection capabilities', () => {
      expect(agent.capabilities).toContain('domain_scrapers');
      expect(agent.capabilities).toContain('custom_extraction');
      expect(agent.capabilities).toContain('real_time_feeds');
      expect(agent.capabilities).toContain('data_validation');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('structured_scraper');
      expect(agent.requiredSkills).toContain('serp_collector');
      expect(agent.requiredSkills).toContain('data_archive');
    });
  });

  describe('Planning', () => {
    it('should create data collection plan', async () => {
      const context: AgentContext = {
        mission: 'Collect product data from amazon for laptops',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.requiredSkills).toEqual(agent.requiredSkills);
    });

    it('should handle search engine data collection', async () => {
      const context: AgentContext = {
        mission: 'Collect SERP data from google for keyword "AI tools"',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      expect(plan.reasoning).toBeDefined();
    });

    it('should estimate cost based on data volume', async () => {
      const context: AgentContext = { mission: 'Collect data', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Execution', () => {
    it('should execute data collection', async () => {
      const context: AgentContext = {
        mission: 'Collect product listings from ebay',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
    });

    it('should produce data artifacts', async () => {
      const context: AgentContext = { mission: 'Collect data from linkedin', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.artifacts).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify data collection results', async () => {
      const context: AgentContext = { mission: 'Collect reviews from yelp', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.length).toBeGreaterThan(0);
    });

    it('should check data validation', async () => {
      const context: AgentContext = { mission: 'Collect data', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.checks.some(c => c.name.toLowerCase().includes('valid') || c.name.toLowerCase().includes('data'))).toBe(true);
    });
  });
});
