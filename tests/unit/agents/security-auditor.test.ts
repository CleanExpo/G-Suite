/**
 * Security Auditor Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Google AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Security analysis complete',
    },
    usageMetadata: {
      promptTokenCount: 200,
      candidatesTokenCount: 300,
      totalTokenCount: 500,
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

import { SecurityAuditorAgent } from '@/agents/security-auditor';
import type { AgentContext } from '@/agents/base';

describe('SecurityAuditorAgent', () => {
  let agent: SecurityAuditorAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new SecurityAuditorAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('security-auditor');
    });

    it('should have security capabilities', () => {
      expect(agent.capabilities).toContain('vulnerability_scanning');
      expect(agent.capabilities).toContain('owasp_compliance');
      expect(agent.capabilities).toContain('penetration_testing');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('security');
      expect(agent.requiredSkills).toContain('owasp');
      expect(agent.requiredSkills).toContain('encryption');
    });
  });

  describe('Planning', () => {
    it('should create comprehensive security audit plan', async () => {
      const context: AgentContext = {
        mission: 'Perform security audit',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(3);
      expect(plan.steps.some(s => s.id === 'dependency_scan')).toBe(true);
      expect(plan.steps.some(s => s.id === 'secrets_scan')).toBe(true);
    });

    it('should include auth review step', async () => {
      const context: AgentContext = {
        mission: 'Security review',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const authStep = plan.steps.find(s => s.id === 'auth_review');
      expect(authStep).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should produce security findings', async () => {
      const context: AgentContext = {
        mission: 'Security audit',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should include security summary', async () => {
      const context: AgentContext = {
        mission: 'Security audit',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      const summary = result.artifacts?.find(a => a.name === 'security_summary');
      expect(summary).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify security audit completion', async () => {
      const context: AgentContext = {
        mission: 'Security audit',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'OWASP Compliance')).toBe(true);
    });
  });
});
