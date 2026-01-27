/**
 * Agent Performance Analytics
 *
 * Phase 4: Cross-Mission Intelligence
 * Provides analytics on agent performance across missions
 */

export interface AgentPerformanceMetrics {
    agentName: string;
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
    avgQualityScore: number;
    commonFailurePatterns: string[];
    bestUseCases: string[];
    trendingPerformance: 'improving' | 'stable' | 'declining';
}

/**
 * Get performance metrics for a specific agent
 */
export async function getAgentPerformance(
    agentName: string,
    timeWindow: 'day' | 'week' | 'month' = 'week'
): Promise<AgentPerformanceMetrics> {
    try {
        const prisma = (await import('@prisma/client')).PrismaClient;
        const db = new prisma();

        // Calculate time window
        const now = new Date();
        const since = new Date();
        switch (timeWindow) {
            case 'day':
                since.setDate(now.getDate() - 1);
                break;
            case 'week':
                since.setDate(now.getDate() - 7);
                break;
            case 'month':
                since.setMonth(now.getMonth() - 1);
                break;
        }

        // Query missions that used this agent
        const learnings = await db.missionLearning.findMany({
            where: {
                agentsUsed: { has: agentName },
                timestamp: { gte: since }
            },
            orderBy: { timestamp: 'desc' }
        });

        await db.$disconnect();

        if (learnings.length === 0) {
            return {
                agentName,
                totalExecutions: 0,
                successRate: 0,
                avgDuration: 0,
                avgQualityScore: 0,
                commonFailurePatterns: [],
                bestUseCases: [],
                trendingPerformance: 'stable'
            };
        }

        // Calculate metrics
        const successful = learnings.filter((l: any) => l.success);
        const successRate = (successful.length / learnings.length) * 100;
        const avgDuration = learnings.reduce((sum: number, l: any) => sum + l.duration, 0) / learnings.length;
        const avgQualityScore = learnings
            .filter((l: any) => l.qualityScore !== null)
            .reduce((sum: number, l: any) => sum + (l.qualityScore ?? 0), 0) / learnings.length;

        // Extract failure patterns
        const failed = learnings.filter((l: any) => !l.success);
        const failurePatterns = extractFailurePatterns(failed);

        // Extract best use cases
        const bestUseCases = extractUseCases(successful);

        // Calculate trend
        const trendingPerformance = calculateTrend(learnings);

        return {
            agentName,
            totalExecutions: learnings.length,
            successRate,
            avgDuration,
            avgQualityScore,
            commonFailurePatterns: failurePatterns,
            bestUseCases,
            trendingPerformance
        };

    } catch (error: any) {
        console.error('[getAgentPerformance] Error:', error.message);
        return {
            agentName,
            totalExecutions: 0,
            successRate: 0,
            avgDuration: 0,
            avgQualityScore: 0,
            commonFailurePatterns: [],
            bestUseCases: [],
            trendingPerformance: 'stable'
        };
    }
}

/**
 * Get overall system performance across all agents
 */
export async function getSystemPerformance(
    timeWindow: 'day' | 'week' | 'month' = 'week'
): Promise<{
    totalMissions: number;
    successRate: number;
    avgQualityScore: number;
    topPerformingAgents: string[];
    improvementAreas: string[];
}> {
    try {
        const prisma = (await import('@prisma/client')).PrismaClient;
        const db = new prisma();

        const now = new Date();
        const since = new Date();
        switch (timeWindow) {
            case 'day':
                since.setDate(now.getDate() - 1);
                break;
            case 'week':
                since.setDate(now.getDate() - 7);
                break;
            case 'month':
                since.setMonth(now.getMonth() - 1);
                break;
        }

        const learnings = await db.missionLearning.findMany({
            where: { timestamp: { gte: since } },
            orderBy: { timestamp: 'desc' }
        });

        await db.$disconnect();

        if (learnings.length === 0) {
            return {
                totalMissions: 0,
                successRate: 0,
                avgQualityScore: 0,
                topPerformingAgents: [],
                improvementAreas: []
            };
        }

        const successful = learnings.filter((l: any) => l.success);
        const successRate = (successful.length / learnings.length) * 100;
        const avgQualityScore = learnings
            .filter((l: any) => l.qualityScore !== null)
            .reduce((sum: number, l: any) => sum + (l.qualityScore ?? 0), 0) / learnings.length;

        // Find top performing agents
        const agentScores = new Map<string, { count: number; successCount: number }>();
        for (const learning of learnings) {
            for (const agent of learning.agentsUsed) {
                const existing = agentScores.get(agent) || { count: 0, successCount: 0 };
                existing.count++;
                if (learning.success) existing.successCount++;
                agentScores.set(agent, existing);
            }
        }

        const topPerformingAgents = Array.from(agentScores.entries())
            .filter(([_, stats]) => stats.count >= 3)
            .sort((a, b) => b[1].successCount / b[1].count - a[1].successCount / a[1].count)
            .slice(0, 5)
            .map(([agent]) => agent);

        // Identify improvement areas
        const improvementAreas: string[] = [];
        if (successRate < 80) {
            improvementAreas.push('Success rate below target');
        }
        if (avgQualityScore < 85) {
            improvementAreas.push('Average quality below threshold');
        }

        const avgRetries = learnings.reduce((sum: number, l: any) => sum + l.retryCount, 0) / learnings.length;
        if (avgRetries > 1) {
            improvementAreas.push('High retry rate');
        }

        return {
            totalMissions: learnings.length,
            successRate,
            avgQualityScore,
            topPerformingAgents,
            improvementAreas
        };

    } catch (error: any) {
        console.error('[getSystemPerformance] Error:', error.message);
        return {
            totalMissions: 0,
            successRate: 0,
            avgQualityScore: 0,
            topPerformingAgents: [],
            improvementAreas: []
        };
    }
}

/**
 * Extract common failure patterns from failed missions
 */
function extractFailurePatterns(failed: any[]): string[] {
    const patterns = new Map<string, number>();

    for (const learning of failed) {
        for (const insight of learning.insights || []) {
            const count = patterns.get(insight) || 0;
            patterns.set(insight, count + 1);
        }
    }

    return Array.from(patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern]) => pattern);
}

/**
 * Extract best use cases from successful missions
 */
function extractUseCases(successful: any[]): string[] {
    const useCases = new Map<string, number>();

    for (const learning of successful) {
        const count = useCases.get(learning.missionType) || 0;
        useCases.set(learning.missionType, count + 1);
    }

    return Array.from(useCases.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([useCase]) => useCase);
}

/**
 * Calculate performance trend
 */
function calculateTrend(learnings: any[]): 'improving' | 'stable' | 'declining' {
    if (learnings.length < 10) {
        return 'stable';
    }

    // Split into two halves
    const mid = Math.floor(learnings.length / 2);
    const recent = learnings.slice(0, mid);
    const older = learnings.slice(mid);

    const recentSuccessRate = recent.filter(l => l.success).length / recent.length;
    const olderSuccessRate = older.filter(l => l.success).length / older.length;

    const diff = recentSuccessRate - olderSuccessRate;

    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
}

export default {
    getAgentPerformance,
    getSystemPerformance
};
