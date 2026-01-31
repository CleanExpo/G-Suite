/**
 * Docs Writer Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => '# Documentation' },
          usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 300 },
        }),
      };
    }
  },
}));

import { DocsWriterAgent } from '@/agents/docs-writer';
import type { AgentContext } from '@/agents/base';

describe('DocsWriterAgent', () => {
  let agent: DocsWriterAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new DocsWriterAgent();
  });

  describe('Initialization', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('docs-writer');
    });

    it('should have documentation capabilities', () => {
      expect(agent.capabilities).toContain('readme_generation');
      expect(agent.capabilities).toContain('api_documentation');
      expect(agent.capabilities).toContain('jsdoc_tsdoc');
    });

    it('should have required skills', () => {
      expect(agent.requiredSkills).toContain('technical_writing');
      expect(agent.requiredSkills).toContain('markdown');
      expect(agent.requiredSkills).toContain('openapi');
    });
  });

  describe('Planning', () => {
    it('should create README plan', async () => {
      const context: AgentContext = { mission: 'Write README for the project', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'write_readme')).toBe(true);
    });

    it('should create API docs plan', async () => {
      const context: AgentContext = { mission: 'Generate API documentation', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'api_docs')).toBe(true);
    });

    it('should include doc review step', async () => {
      const context: AgentContext = { mission: 'Write docs', userId: 'user_123' };
      const plan = await agent.plan(context);

      expect(plan.steps.some(s => s.id === 'review_docs')).toBe(true);
    });
  });

  describe('Execution', () => {
    it('should generate documentation', async () => {
      const context: AgentContext = { mission: 'Write README', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);

      expect(result.success).toBe(true);
      expect(result.artifacts?.some(a => a.type === 'documentation')).toBe(true);
    });
  });

  describe('Verification', () => {
    it('should verify documentation', async () => {
      const context: AgentContext = { mission: 'Write README', userId: 'user_123' };
      const plan = await agent.plan(context);
      const result = await agent.execute(plan, context);
      const verification = await agent.verify(result, context);

      expect(verification.passed).toBe(true);
      expect(verification.checks.some(c => c.name === 'Spelling Check')).toBe(true);
    });
  });
});
