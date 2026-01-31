/**
 * Frontend Specialist Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Google AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Generated frontend code',
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

import { FrontendSpecialistAgent } from '@/agents/frontend-specialist';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('FrontendSpecialistAgent', () => {
  let agent: FrontendSpecialistAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new FrontendSpecialistAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('frontend-specialist');
    });

    it('should have React/Next.js capabilities', () => {
      expect(agent.capabilities).toContain('react_components');
      expect(agent.capabilities).toContain('nextjs_routing');
      expect(agent.capabilities).toContain('typescript');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('react');
      expect(agent.requiredSkills).toContain('nextjs');
      expect(agent.requiredSkills).toContain('tailwind');
    });
  });

  describe('Planning', () => {
    it('should create component plan for UI missions', async () => {
      const context: AgentContext = {
        mission: 'Create a new component for the dashboard',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.estimatedCost).toBeGreaterThan(0);
      expect(plan.requiredSkills).toContain('react');
    });

    it('should include accessibility audit step', async () => {
      const context: AgentContext = {
        mission: 'Build a new page with forms',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const a11yStep = plan.steps.find(s => s.id === 'accessibility_audit');
      expect(a11yStep).toBeDefined();
    });

    it('should include performance check step', async () => {
      const context: AgentContext = {
        mission: 'Create component',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const perfStep = plan.steps.find(s => s.id === 'performance_check');
      expect(perfStep).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should execute and return artifacts', async () => {
      const context: AgentContext = {
        mission: 'Create a button component',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts).toBeDefined();
      expect(result.artifacts!.length).toBeGreaterThan(0);
      expect(result.tokensUsed).toBeDefined();
    });

    it('should track token usage', async () => {
      const context: AgentContext = {
        mission: 'Create a component',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.tokensUsed).toBeDefined();
      expect(result.tokensUsed?.totalTokens).toBeGreaterThan(0);
    });
  });

  describe('Verification', () => {
    it('should verify successful result', async () => {
      const context: AgentContext = {
        mission: 'Create component',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.length).toBeGreaterThan(0);
    });

    it('should provide recommendations', async () => {
      const context: AgentContext = {
        mission: 'Create component',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.recommendations).toBeDefined();
      expect(verification.recommendations!.length).toBeGreaterThan(0);
    });
  });
});
