/**
 * Deploy Guardian Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Deployment config' },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

import { DeployGuardianAgent } from '@/agents/deploy-guardian';
import type { AgentContext } from '@/agents/base';

describe('DeployGuardianAgent', () => {
  let agent: DeployGuardianAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new DeployGuardianAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('deploy-guardian');
    });

    it('should have CI/CD capabilities', () => {
      expect(agent.capabilities).toContain('cicd_pipelines');
      expect(agent.capabilities).toContain('deployment_strategies');
      expect(agent.capabilities).toContain('zero_downtime_deploy');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('github_actions');
      expect(agent.requiredSkills).toContain('vercel');
      expect(agent.requiredSkills).toContain('docker');
    });
  });

  describe('Planning', () => {
    it('should create deployment plan', async () => {
      const context: AgentContext = { mission: 'Deploy to production', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(3);
      expect(plan.steps.some(s => s.id === 'pre_deploy_checks')).toBe(true);
      expect(plan.steps.some(s => s.id === 'deploy_production')).toBe(true);
    });

    it('should include staging deployment', async () => {
      const context: AgentContext = { mission: 'Deploy', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'deploy_staging')).toBe(true);
    });
  });

  describe('Execution', () => {
    it('should execute deployment', async () => {
      const context: AgentContext = { mission: 'Deploy', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.some(a => a.name === 'deployment_summary')).toBe(true);
    });
  });

  describe('Verification', () => {
    it('should verify deployment', async () => {
      const context: AgentContext = { mission: 'Deploy', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Rollback Ready')).toBe(true);
    });
  });
});
