/**
 * Cost Optimizer Tests
 *
 * Phase 9.2: Tests for AI-powered cost optimization.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/prisma', () => ({
  default: {
    mission: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

// Mock Gemini
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify([
        {
          type: 'caching',
          priority: 'medium',
          title: 'Implement result caching',
          description: 'Cache repeated queries',
          estimatedSavings: 15,
          implementation: 'Add Redis caching layer',
        },
      ]),
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

import prisma from '@/prisma';
import { CostOptimizer } from '@/lib/telemetry/cost-optimizer';

describe('CostOptimizer', () => {
  let optimizer: CostOptimizer;

  beforeEach(() => {
    vi.clearAllMocks();
    optimizer = new CostOptimizer();
  });

  describe('getQuickSummary', () => {
    it('should return cost summary for user', async () => {
      vi.mocked(prisma.mission.aggregate)
        .mockResolvedValueOnce({ _sum: { cost: 500 }, _count: 10 } as any)
        .mockResolvedValueOnce({ _sum: { cost: 1500 } } as any);

      vi.mocked(prisma.mission.findMany).mockResolvedValue([
        {
          agentCosts: {
            'geo-marketing-agent': { cost: 200, tokens: 5000, duration: 3000, success: true },
            'content-orchestrator': { cost: 100, tokens: 2500, duration: 1500, success: true },
          },
        },
      ] as any);

      const summary = await optimizer.getQuickSummary('user_123');

      expect(summary.last7DaysCost).toBe(500);
      expect(summary.last30DaysCost).toBe(1500);
      expect(summary.missionCount).toBe(10);
      expect(summary.topAgent?.name).toBe('geo-marketing-agent');
    });

    it('should handle empty data', async () => {
      vi.mocked(prisma.mission.aggregate)
        .mockResolvedValueOnce({ _sum: { cost: null }, _count: 0 } as any)
        .mockResolvedValueOnce({ _sum: { cost: null } } as any);

      vi.mocked(prisma.mission.findMany).mockResolvedValue([]);

      const summary = await optimizer.getQuickSummary('user_123');

      expect(summary.last7DaysCost).toBe(0);
      expect(summary.missionCount).toBe(0);
      expect(summary.topAgent).toBeNull();
    });
  });

  describe('analyzeCosts', () => {
    it('should analyze cost patterns and generate recommendations', async () => {
      const mockMissions = [
        {
          id: 'mission_1',
          cost: 100,
          createdAt: new Date(),
          agentCosts: {
            'agent-a': { cost: 60, tokens: 3000, duration: 2000, success: true, agentName: 'agent-a' },
            'agent-b': { cost: 40, tokens: 2000, duration: 1000, success: true, agentName: 'agent-b' },
          },
        },
        {
          id: 'mission_2',
          cost: 150,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          agentCosts: {
            'agent-a': { cost: 90, tokens: 4500, duration: 3000, success: true, agentName: 'agent-a' },
            'agent-b': { cost: 60, tokens: 3000, duration: 1500, success: false, agentName: 'agent-b' },
          },
        },
      ];

      vi.mocked(prisma.mission.findMany).mockResolvedValue(mockMissions as any);

      const analysis = await optimizer.analyzeCosts('user_123');

      expect(analysis.totalCost).toBe(250);
      expect(analysis.costByAgent['agent-a']).toBe(150);
      expect(analysis.costByAgent['agent-b']).toBe(100);
      expect(analysis.patterns).toHaveLength(2);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.projectedMonthlyCost).toBeGreaterThan(0);
    });

    it('should identify high-cost agents', async () => {
      const mockMissions = [
        {
          id: 'mission_1',
          cost: 100,
          createdAt: new Date(),
          agentCosts: {
            'expensive-agent': { cost: 90, tokens: 10000, duration: 5000, success: true, agentName: 'expensive-agent' },
            'cheap-agent': { cost: 10, tokens: 500, duration: 500, success: true, agentName: 'cheap-agent' },
          },
        },
      ];

      vi.mocked(prisma.mission.findMany).mockResolvedValue(mockMissions as any);

      const analysis = await optimizer.analyzeCosts('user_123');

      // Should have recommendation for high-cost agent
      const highCostRec = analysis.recommendations.find(
        r => r.title.includes('expensive-agent')
      );
      expect(highCostRec).toBeDefined();
      expect(highCostRec?.priority).toBe('high');
    });

    it('should identify low success rate agents', async () => {
      const mockMissions = Array.from({ length: 10 }, (_, i) => ({
        id: `mission_${i}`,
        cost: 50,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        agentCosts: {
          'unreliable-agent': {
            cost: 50,
            tokens: 2500,
            duration: 2000,
            success: i < 3, // Only 30% success
            agentName: 'unreliable-agent',
          },
        },
      }));

      vi.mocked(prisma.mission.findMany).mockResolvedValue(mockMissions as any);

      const analysis = await optimizer.analyzeCosts('user_123');

      // Should have recommendation for low success rate
      const reliabilityRec = analysis.recommendations.find(
        r => r.title.includes('reliability') || r.title.includes('success')
      );
      expect(reliabilityRec).toBeDefined();
    });

    it('should handle empty mission data', async () => {
      vi.mocked(prisma.mission.findMany).mockResolvedValue([]);

      const analysis = await optimizer.analyzeCosts('user_123');

      expect(analysis.totalCost).toBe(0);
      expect(analysis.patterns).toHaveLength(0);
      expect(analysis.projectedMonthlyCost).toBe(0);
    });
  });

  describe('pattern calculation', () => {
    it('should detect increasing cost trend', async () => {
      // Create missions with increasing costs over time
      const mockMissions = Array.from({ length: 20 }, (_, i) => ({
        id: `mission_${i}`,
        cost: 50 + i * 5, // Increasing cost
        createdAt: new Date(Date.now() - (19 - i) * 24 * 60 * 60 * 1000),
        agentCosts: {
          'trending-agent': {
            cost: 50 + i * 5,
            tokens: 2500 + i * 100,
            duration: 2000,
            success: true,
            agentName: 'trending-agent',
          },
        },
      }));

      vi.mocked(prisma.mission.findMany).mockResolvedValue(mockMissions as any);

      const analysis = await optimizer.analyzeCosts('user_123');

      const trendingPattern = analysis.patterns.find(p => p.agentName === 'trending-agent');
      expect(trendingPattern?.trend).toBe('increasing');
    });
  });
});
