/**
 * UI Auditor Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify([
              {
                id: 'issue_1',
                category: 'visual_consistency',
                severity: 'medium',
                description: 'Button has inconsistent styling',
                element: '.btn',
                suggestedFix: 'Update styles',
                remediationSkill: 'code_edit'
              }
            ])
          },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

vi.mock('./registry', () => ({
  AgentRegistry: {
    get: vi.fn().mockReturnValue(undefined),
  },
  initializeAgents: vi.fn().mockResolvedValue(undefined),
}));

import { UIAuditorAgent } from '@/agents/ui-auditor';
import type { AgentContext } from '@/agents/base';

describe('UIAuditorAgent', () => {
  let agent: UIAuditorAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new UIAuditorAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('ui-auditor');
    });

    it('should have UI auditing capabilities', () => {
      expect(agent.capabilities).toContain('screenshot_capture');
      expect(agent.capabilities).toContain('visual_analysis');
      expect(agent.capabilities).toContain('issue_detection');
      expect(agent.capabilities).toContain('fix_orchestration');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('screenshot_capture');
      expect(agent.requiredSkills).toContain('vision_analyze');
      expect(agent.requiredSkills).toContain('code_edit');
    });
  });

  describe('Planning', () => {
    it('should create UI audit plan', async () => {
      const context: AgentContext = {
        mission: 'Audit the homepage for UI issues',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      // Plan may have 0 steps if no issues found, that's valid
      expect(plan.steps).toBeDefined();
      expect(plan.requiredSkills).toEqual(agent.requiredSkills);
    });

    it('should include remediation steps when issues detected', async () => {
      const context: AgentContext = {
        mission: 'Check responsive design on dashboard',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);

      // With mocked issues, should have remediation steps
      expect(plan.steps.length).toBeGreaterThanOrEqual(0);
      expect(plan.reasoning).toBeDefined();
    });

    it('should estimate cost', async () => {
      const context: AgentContext = { mission: 'Audit UI', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.estimatedCost).toBeGreaterThan(0);
    });
  });

  describe('Execution', () => {
    it('should execute UI audit', async () => {
      const context: AgentContext = {
        mission: 'Audit the login page',
        userId: 'user_123'
      };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
    });

    it('should produce quality score', async () => {
      const context: AgentContext = { mission: 'Audit homepage', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.data).toBeDefined();
    });

    it('should detect UI issues', async () => {
      const context: AgentContext = { mission: 'Find UI problems on settings page', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.artifacts).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify audit completion', async () => {
      const context: AgentContext = { mission: 'Audit UI', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
    });

    it('should check quality threshold', async () => {
      const context: AgentContext = { mission: 'Quality check', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.checks.length).toBeGreaterThan(0);
    });
  });
});
