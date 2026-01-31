/**
 * Backend Specialist Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Google AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Generated backend code',
    },
    usageMetadata: {
      promptTokenCount: 150,
      candidatesTokenCount: 250,
      totalTokenCount: 400,
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

import { BackendSpecialistAgent } from '@/agents/backend-specialist';
import type { AgentContext } from '@/agents/base';

describe('BackendSpecialistAgent', () => {
  let agent: BackendSpecialistAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new BackendSpecialistAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('backend-specialist');
    });

    it('should have API development capabilities', () => {
      expect(agent.capabilities).toContain('api_design');
      expect(agent.capabilities).toContain('route_handlers');
      expect(agent.capabilities).toContain('authentication');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('nodejs');
      expect(agent.requiredSkills).toContain('prisma');
      expect(agent.requiredSkills).toContain('api_design');
    });
  });

  describe('Planning', () => {
    it('should create API route plan', async () => {
      const context: AgentContext = {
        mission: 'Create a new API endpoint for users',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps.some(s => s.id === 'create_api')).toBe(true);
    });

    it('should include security audit step', async () => {
      const context: AgentContext = {
        mission: 'Build an API',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const securityStep = plan.steps.find(s => s.id === 'security_audit');
      expect(securityStep).toBeDefined();
    });

    it('should detect service layer needs', async () => {
      const context: AgentContext = {
        mission: 'Implement business logic service',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'create_service')).toBe(true);
    });
  });

  describe('Execution', () => {
    it('should execute and return code artifacts', async () => {
      const context: AgentContext = {
        mission: 'Create API route',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts).toBeDefined();
    });

    it('should include security report in artifacts', async () => {
      const context: AgentContext = {
        mission: 'Create API endpoint',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      const securityReport = result.artifacts?.find(a => a.name === 'security_report');
      expect(securityReport).toBeDefined();
    });
  });

  describe('Verification', () => {
    it('should verify successful API implementation', async () => {
      const context: AgentContext = {
        mission: 'Create API',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Security')).toBe(true);
    });
  });
});
