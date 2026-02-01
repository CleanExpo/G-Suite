/**
 * Phase 9.2: Cost Optimization AI
 *
 * Analyzes cost patterns and provides AI-powered recommendations
 * for optimizing agent usage and reducing operational costs.
 */

import prisma from '@/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentCostEntry } from './agent-cost-collector';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export interface CostPattern {
  agentName: string;
  avgCost: number;
  avgTokens: number;
  avgDuration: number;
  executionCount: number;
  successRate: number;
  peakHours: number[];
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface OptimizationRecommendation {
  type: 'agent_optimization' | 'scheduling' | 'caching' | 'budget' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedSavings: number; // Percentage
  implementation: string;
}

export interface CostAnalysisResult {
  totalCost: number;
  costByAgent: Record<string, number>;
  patterns: CostPattern[];
  recommendations: OptimizationRecommendation[];
  projectedMonthlyCost: number;
  potentialSavings: number;
  analysisDate: string;
}

export class CostOptimizer {
  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  /**
   * Analyze cost patterns and generate optimization recommendations.
   */
  async analyzeCosts(userId: string): Promise<CostAnalysisResult> {
    // Fetch recent mission data
    const missions = await prisma.mission.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        cost: true,
        agentCosts: true,
        createdAt: true,
      },
    });

    // Calculate total costs
    const totalCost = missions.reduce((sum, m) => sum + m.cost, 0);

    // Aggregate costs by agent
    const costByAgent: Record<string, number> = {};
    const agentMetrics: Record<
      string,
      {
        costs: number[];
        tokens: number[];
        durations: number[];
        successes: number;
        failures: number;
        hours: number[];
      }
    > = {};

    for (const mission of missions) {
      if (!mission.agentCosts || typeof mission.agentCosts !== 'object') continue;
      const costs = mission.agentCosts as unknown as Record<string, AgentCostEntry>;
      const hour = new Date(mission.createdAt).getHours();

      for (const [agentName, entry] of Object.entries(costs)) {
        if (!costByAgent[agentName]) {
          costByAgent[agentName] = 0;
        }
        costByAgent[agentName] += entry.cost || 0;

        if (!agentMetrics[agentName]) {
          agentMetrics[agentName] = {
            costs: [],
            tokens: [],
            durations: [],
            successes: 0,
            failures: 0,
            hours: [],
          };
        }

        agentMetrics[agentName].costs.push(entry.cost || 0);
        agentMetrics[agentName].tokens.push(entry.tokens || 0);
        agentMetrics[agentName].durations.push(entry.duration || 0);
        agentMetrics[agentName].hours.push(hour);

        if (entry.success) {
          agentMetrics[agentName].successes++;
        } else {
          agentMetrics[agentName].failures++;
        }
      }
    }

    // Calculate patterns
    const patterns = this.calculatePatterns(agentMetrics);

    // Generate AI recommendations
    const recommendations = await this.generateRecommendations(patterns, totalCost);

    // Project monthly cost
    const daysInData =
      missions.length > 0
        ? Math.ceil(
            (Date.now() - new Date(missions[missions.length - 1].createdAt).getTime()) /
              (24 * 60 * 60 * 1000),
          )
        : 30;
    const dailyRate = totalCost / Math.max(daysInData, 1);
    const projectedMonthlyCost = Math.round(dailyRate * 30);

    // Calculate potential savings
    const potentialSavings = recommendations.reduce(
      (sum, r) => sum + (r.estimatedSavings / 100) * projectedMonthlyCost,
      0,
    );

    return {
      totalCost,
      costByAgent,
      patterns,
      recommendations,
      projectedMonthlyCost,
      potentialSavings: Math.round(potentialSavings),
      analysisDate: new Date().toISOString(),
    };
  }

  /**
   * Calculate cost patterns for each agent.
   */
  private calculatePatterns(
    agentMetrics: Record<
      string,
      {
        costs: number[];
        tokens: number[];
        durations: number[];
        successes: number;
        failures: number;
        hours: number[];
      }
    >,
  ): CostPattern[] {
    const patterns: CostPattern[] = [];

    for (const [agentName, metrics] of Object.entries(agentMetrics)) {
      const totalExecutions = metrics.successes + metrics.failures;
      if (totalExecutions === 0) continue;

      const avgCost = metrics.costs.reduce((a, b) => a + b, 0) / metrics.costs.length;
      const avgTokens = metrics.tokens.reduce((a, b) => a + b, 0) / metrics.tokens.length;
      const avgDuration = metrics.durations.reduce((a, b) => a + b, 0) / metrics.durations.length;
      const successRate = metrics.successes / totalExecutions;

      // Find peak hours
      const hourCounts: Record<number, number> = {};
      for (const hour of metrics.hours) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
      const maxCount = Math.max(...Object.values(hourCounts));
      const peakHours = Object.entries(hourCounts)
        .filter(([, count]) => count >= maxCount * 0.8)
        .map(([hour]) => parseInt(hour))
        .sort((a, b) => a - b);

      // Determine trend (compare first half vs second half)
      const midpoint = Math.floor(metrics.costs.length / 2);
      const firstHalf = metrics.costs.slice(0, midpoint);
      const secondHalf = metrics.costs.slice(midpoint);
      const firstAvg =
        firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
      const secondAvg =
        secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

      patterns.push({
        agentName,
        avgCost: Math.round(avgCost),
        avgTokens: Math.round(avgTokens),
        avgDuration: Math.round(avgDuration),
        executionCount: totalExecutions,
        successRate,
        peakHours,
        trend,
      });
    }

    // Sort by total cost (avgCost * executionCount)
    return patterns.sort((a, b) => b.avgCost * b.executionCount - a.avgCost * a.executionCount);
  }

  /**
   * Generate AI-powered optimization recommendations.
   */
  private async generateRecommendations(
    patterns: CostPattern[],
    totalCost: number,
  ): Promise<OptimizationRecommendation[]> {
    // Generate rule-based recommendations first
    const recommendations: OptimizationRecommendation[] = [];

    // Check for high-cost agents
    for (const pattern of patterns) {
      const agentTotalCost = pattern.avgCost * pattern.executionCount;
      const costShare = agentTotalCost / totalCost;

      if (costShare > 0.5) {
        recommendations.push({
          type: 'agent_optimization',
          priority: 'high',
          title: `Optimise ${pattern.agentName} (${Math.round(costShare * 100)}% of costs)`,
          description:
            'This agent accounts for over half of your costs. Consider caching results, reducing token usage, or using a lighter model for simple tasks.',
          estimatedSavings: 15,
          implementation:
            'Review agent prompts for verbosity. Implement result caching for repeated queries. Consider prompt compression.',
        });
      }

      if (pattern.successRate < 0.7) {
        recommendations.push({
          type: 'agent_optimization',
          priority: 'high',
          title: `Improve ${pattern.agentName} reliability (${Math.round(pattern.successRate * 100)}% success)`,
          description:
            'Low success rate means wasted tokens on failed attempts. Improving reliability will reduce retry costs.',
          estimatedSavings: Math.round((1 - pattern.successRate) * 100 * 0.5),
          implementation:
            'Add better error handling. Validate inputs before agent execution. Consider fallback strategies.',
        });
      }

      if (pattern.trend === 'increasing') {
        recommendations.push({
          type: 'general',
          priority: 'medium',
          title: `Monitor ${pattern.agentName} cost trend`,
          description:
            'Costs for this agent are increasing. Review recent changes and set up budget alerts.',
          estimatedSavings: 10,
          implementation:
            'Create a budget alert rule for this agent. Review recent prompt or workflow changes.',
        });
      }
    }

    // Check for peak hour optimizations
    const allPeakHours = patterns.flatMap((p) => p.peakHours);
    const peakHourCounts: Record<number, number> = {};
    for (const hour of allPeakHours) {
      peakHourCounts[hour] = (peakHourCounts[hour] || 0) + 1;
    }
    const busyHours = Object.entries(peakHourCounts)
      .filter(([, count]) => count >= patterns.length * 0.5)
      .map(([hour]) => parseInt(hour));

    if (busyHours.length <= 4) {
      recommendations.push({
        type: 'scheduling',
        priority: 'low',
        title: 'Consider load balancing across hours',
        description: `Most missions run during ${busyHours.map((h) => `${h}:00`).join(', ')}. Spreading workload may reduce peak costs.`,
        estimatedSavings: 5,
        implementation:
          'Schedule non-urgent missions during off-peak hours. Consider batch processing.',
      });
    }

    // Use AI for additional recommendations if we have patterns
    if (patterns.length > 0) {
      try {
        const aiRecommendations = await this.getAIRecommendations(patterns);
        recommendations.push(...aiRecommendations);
      } catch (err: any) {
        console.warn('[CostOptimizer] AI recommendations failed:', err.message);
      }
    }

    // Sort by priority and estimated savings
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedSavings - a.estimatedSavings;
    });
  }

  /**
   * Get AI-powered recommendations from Gemini.
   */
  private async getAIRecommendations(
    patterns: CostPattern[],
  ): Promise<OptimizationRecommendation[]> {
    const prompt = `Analyze these agent cost patterns and provide 2-3 specific optimization recommendations:

${JSON.stringify(patterns, null, 2)}

Focus on:
1. Token efficiency improvements
2. Caching opportunities
3. Agent workflow optimizations

Return JSON array:
[
  {
    "type": "caching" | "agent_optimization" | "general",
    "priority": "high" | "medium" | "low",
    "title": "Brief title",
    "description": "Why this matters",
    "estimatedSavings": 5-30 (percentage),
    "implementation": "How to implement"
  }
]`;

    const result = await this.model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/gi, '')
      .trim();
    return JSON.parse(text);
  }

  /**
   * Get quick cost summary without AI analysis.
   */
  async getQuickSummary(userId: string): Promise<{
    last7DaysCost: number;
    last30DaysCost: number;
    topAgent: { name: string; cost: number } | null;
    missionCount: number;
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [last7Days, last30Days] = await Promise.all([
      prisma.mission.aggregate({
        where: { userId, status: 'COMPLETED', createdAt: { gte: sevenDaysAgo } },
        _sum: { cost: true },
        _count: true,
      }),
      prisma.mission.aggregate({
        where: { userId, status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
        _sum: { cost: true },
      }),
    ]);

    // Find top cost agent
    const recentMissions = await prisma.mission.findMany({
      where: { userId, status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
      select: { agentCosts: true },
    });

    const agentCosts: Record<string, number> = {};
    for (const mission of recentMissions) {
      if (!mission.agentCosts || typeof mission.agentCosts !== 'object') continue;
      const costs = mission.agentCosts as unknown as Record<string, AgentCostEntry>;
      for (const [name, entry] of Object.entries(costs)) {
        agentCosts[name] = (agentCosts[name] || 0) + (entry.cost || 0);
      }
    }

    const topAgent = Object.entries(agentCosts).sort((a, b) => b[1] - a[1])[0];

    return {
      last7DaysCost: last7Days._sum.cost || 0,
      last30DaysCost: last30Days._sum.cost || 0,
      topAgent: topAgent ? { name: topAgent[0], cost: topAgent[1] } : null,
      missionCount: last7Days._count,
    };
  }
}

export const costOptimizer = new CostOptimizer();
