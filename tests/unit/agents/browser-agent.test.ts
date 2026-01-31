/**
 * Browser Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify([
              { action: 'navigate', value: 'https://example.com' },
              { action: 'screenshot', options: { fullPage: true } }
            ])
          },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

import { BrowserAgent } from '@/agents/browser-agent';
import type { AgentContext } from '@/agents/base';

describe('BrowserAgent', () => {
  let agent: BrowserAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new BrowserAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('browser-agent');
    });

    it('should have browser capabilities', () => {
      expect(agent.capabilities).toContain('web_navigation');
      expect(agent.capabilities).toContain('element_interaction');
      expect(agent.capabilities).toContain('data_extraction');
      expect(agent.capabilities).toContain('screenshot_capture');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('puppeteer_navigate');
      expect(agent.requiredSkills).toContain('puppeteer_interact');
    });

    it('should have default configuration', () => {
      const config = agent.getConfig();
      expect(config.headless).toBe(true);
      expect(config.viewport).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('Planning', () => {
    it('should create navigation plan from URL mission', async () => {
      const context: AgentContext = {
        mission: 'Navigate to https://example.com and take a screenshot',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.requiredSkills).toEqual(agent.requiredSkills);
    });

    it('should initialise session on planning', async () => {
      const context: AgentContext = { mission: 'Visit https://test.com', userId: 'user_123' };
      await agent.plan(context);

      const session = agent.getSession();
      expect(session).toBeDefined();
      expect(session?.id).toMatch(/^browser_\d+$/);
    });

    it('should estimate cost based on operations', async () => {
      const context: AgentContext = { mission: 'Navigate and screenshot', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Execution', () => {
    it('should execute browser operations', async () => {
      const context: AgentContext = {
        mission: 'Navigate to https://example.com and take screenshot',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('sessionId');
    });

    it('should record page states', async () => {
      const context: AgentContext = { mission: 'Visit https://test.com', userId: 'user_123' };
      const plan = await agent.plan(context);
      await agent.execute(plan, context);

      const session = agent.getSession();
      expect(session?.pageStates.length).toBeGreaterThan(0);
    });

    it('should generate screenshot artifacts', async () => {
      const context: AgentContext = { mission: 'Screenshot https://test.com', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      const screenshotArtifact = result.artifacts?.find(a => a.name.includes('screenshot'));
      expect(screenshotArtifact).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify successful browser session', async () => {
      const context: AgentContext = { mission: 'Browse https://test.com', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Operations Completed')).toBe(true);
    });

    it('should check for captured data', async () => {
      const context: AgentContext = { mission: 'Visit and screenshot', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.checks.some(c => c.name === 'Data Captured')).toBe(true);
    });
  });
});
