/**
 * Cost-to-Quality Optimization
 *
 * Phase 5: Advanced Capabilities
 * Optimizes mission strategy based on cost and quality constraints
 */

export interface OptimizationStrategy {
  strategy: 'cost-optimal' | 'quality-optimal' | 'balanced';
  agentSelection: string[];
  expectedCost: number;
  expectedQuality: number;
  estimatedDuration: number;
  reasoning: string;
}

export interface OptimizationConstraints {
  budget?: number; // Maximum cost allowed
  minQuality?: number; // Minimum quality score (0-100)
  maxDuration?: number; // Maximum duration in milliseconds
  preferredAgents?: string[]; // Agents to prefer if possible
}

/**
 * Optimize mission strategy based on constraints
 */
export async function optimizeMissionStrategy(
  missionType: string,
  constraints: OptimizationConstraints = {},
): Promise<OptimizationStrategy> {
  try {
    const prisma = (await import('@prisma/client')).PrismaClient;
    const db = new prisma();

    // Query historical data for this mission type
    const learnings = await db.missionLearning.findMany({
      where: { missionType },
      take: 100,
      orderBy: { timestamp: 'desc' },
    });

    await db.$disconnect();

    if (learnings.length < 5) {
      // Not enough data, use defaults
      return {
        strategy: 'balanced',
        agentSelection: ['content-orchestrator'],
        expectedCost: 100,
        expectedQuality: 80,
        estimatedDuration: 60000,
        reasoning: 'Insufficient historical data. Using default strategy.',
      };
    }

    // Build cost-quality data points
    const dataPoints = learnings.map((l: any) => ({
      agents: l.agentsUsed,
      cost: l.duration / 1000, // Simplified cost estimate
      quality: l.qualityScore ?? 0,
      duration: l.duration,
      success: l.success,
    }));

    // Find Pareto-optimal solutions
    const paretoFront = findParetoFront(dataPoints);

    // Select strategy based on constraints
    if (constraints.budget !== undefined) {
      // Cost-constrained optimization
      const budget = constraints.budget;
      const affordable = paretoFront.filter((p) => p.cost <= budget);
      if (affordable.length === 0) {
        return {
          strategy: 'cost-optimal',
          agentSelection: ['content-orchestrator'],
          expectedCost: constraints.budget,
          expectedQuality: 70,
          estimatedDuration: 30000,
          reasoning: 'No historical solutions within budget. Using minimal strategy.',
        };
      }

      // Pick highest quality within budget
      const best = affordable.reduce((prev, curr) => (curr.quality > prev.quality ? curr : prev));

      return {
        strategy: 'cost-optimal',
        agentSelection: best.agents,
        expectedCost: best.cost,
        expectedQuality: best.quality,
        estimatedDuration: best.duration,
        reasoning: `Optimized for max quality within budget ${constraints.budget}`,
      };
    }

    if (constraints.minQuality !== undefined) {
      // Quality-constrained optimization
      const minQuality = constraints.minQuality;
      const sufficient = paretoFront.filter((p) => p.quality >= minQuality);
      if (sufficient.length === 0) {
        return {
          strategy: 'quality-optimal',
          agentSelection: ['content-orchestrator', 'seo-analyst'],
          expectedCost: 200,
          expectedQuality: constraints.minQuality,
          estimatedDuration: 120000,
          reasoning: 'No historical solutions meet quality requirement. Using enhanced strategy.',
        };
      }

      // Pick lowest cost that meets quality
      const best = sufficient.reduce((prev, curr) => (curr.cost < prev.cost ? curr : prev));

      return {
        strategy: 'quality-optimal',
        agentSelection: best.agents,
        expectedCost: best.cost,
        expectedQuality: best.quality,
        estimatedDuration: best.duration,
        reasoning: `Optimized for min cost meeting quality ${constraints.minQuality}%`,
      };
    }

    // Balanced optimization (maximize quality/cost ratio)
    const best = paretoFront.reduce((prev, curr) => {
      const prevRatio = prev.quality / prev.cost;
      const currRatio = curr.quality / curr.cost;
      return currRatio > prevRatio ? curr : prev;
    });

    return {
      strategy: 'balanced',
      agentSelection: best.agents,
      expectedCost: best.cost,
      expectedQuality: best.quality,
      estimatedDuration: best.duration,
      reasoning: `Balanced optimization: ${best.quality.toFixed(1)}% quality at ${best.cost} cost`,
    };
  } catch (error: any) {
    console.error('[optimizeMissionStrategy] Error:', error.message);
    return {
      strategy: 'balanced',
      agentSelection: ['content-orchestrator'],
      expectedCost: 100,
      expectedQuality: 80,
      estimatedDuration: 60000,
      reasoning: `Optimization failed: ${error.message}. Using defaults.`,
    };
  }
}

/**
 * Find Pareto-optimal solutions (maximize quality, minimize cost)
 */
function findParetoFront(
  dataPoints: {
    agents: string[];
    cost: number;
    quality: number;
    duration: number;
    success: boolean;
  }[],
): typeof dataPoints {
  const paretoFront: typeof dataPoints = [];

  // Only consider successful missions
  const successful = dataPoints.filter((p) => p.success && p.quality > 0);

  for (const point of successful) {
    let isDominated = false;

    // Check if this point is dominated by any other point
    for (const other of successful) {
      if (other === point) continue;

      // Other dominates point if it has better or equal quality at lower or equal cost
      const betterQuality = other.quality >= point.quality;
      const lowerCost = other.cost <= point.cost;
      const strictlyBetter = other.quality > point.quality || other.cost < point.cost;

      if (betterQuality && lowerCost && strictlyBetter) {
        isDominated = true;
        break;
      }
    }

    if (!isDominated) {
      paretoFront.push(point);
    }
  }

  return paretoFront;
}

/**
 * Compare two strategies
 */
export function compareStrategies(
  strategy1: OptimizationStrategy,
  strategy2: OptimizationStrategy,
): {
  better: OptimizationStrategy;
  reason: string;
} {
  // Calculate quality/cost ratios
  const ratio1 = strategy1.expectedQuality / strategy1.expectedCost;
  const ratio2 = strategy2.expectedQuality / strategy2.expectedCost;

  if (ratio1 > ratio2) {
    return {
      better: strategy1,
      reason: `Better quality/cost ratio: ${ratio1.toFixed(2)} vs ${ratio2.toFixed(2)}`,
    };
  } else {
    return {
      better: strategy2,
      reason: `Better quality/cost ratio: ${ratio2.toFixed(2)} vs ${ratio1.toFixed(2)}`,
    };
  }
}

export default {
  optimizeMissionStrategy,
  compareStrategies,
};
