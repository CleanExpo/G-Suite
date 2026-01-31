/**
 * Database Specialist Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Google AI
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Generated Prisma schema',
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

import { DatabaseSpecialistAgent } from '@/agents/database-specialist';
import type { AgentContext } from '@/agents/base';

describe('DatabaseSpecialistAgent', () => {
  let agent: DatabaseSpecialistAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new DatabaseSpecialistAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('database-specialist');
    });

    it('should have database capabilities', () => {
      expect(agent.capabilities).toContain('schema_design');
      expect(agent.capabilities).toContain('migrations');
      expect(agent.capabilities).toContain('query_optimization');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('postgresql');
      expect(agent.requiredSkills).toContain('prisma');
      expect(agent.requiredSkills).toContain('sql');
    });
  });

  describe('Planning', () => {
    it('should create schema design plan', async () => {
      const context: AgentContext = {
        mission: 'Design database schema for users table',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps.some(s => s.id === 'design_schema')).toBe(true);
    });

    it('should create migration plan when requested', async () => {
      const context: AgentContext = {
        mission: 'Create a migration for the new column',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'create_migration')).toBe(true);
    });

    it('should include schema validation step', async () => {
      const context: AgentContext = {
        mission: 'Design schema',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);

      const validateStep = plan.steps.find(s => s.id === 'validate_schema');
      expect(validateStep).toBeDefined();
    });
  });

  describe('Execution', () => {
    it('should generate database code', async () => {
      const context: AgentContext = {
        mission: 'Create schema',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.length).toBeGreaterThan(0);
    });
  });

  describe('Verification', () => {
    it('should verify database implementation', async () => {
      const context: AgentContext = {
        mission: 'Create schema',
        userId: 'user_123',
      };

      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Schema Valid')).toBe(true);
    });
  });
});
