/**
 * UNI-168: Metrics Collector
 *
 * Core metrics aggregation service that collects data from multiple sources:
 * - TaskQueue (queue metrics)
 * - Prisma models (Mission, QueueJob, DeadLetterEntry, AgentStatus)
 * - Cost telemetry
 */

import prisma from '@/prisma';
import { taskQueue } from '@/lib/queue/task-queue';
import type {
  SystemMetrics,
  AgentStatusDetail,
  MetricSnapshotData,
  DataPoint,
  AgentStatusBreakdown,
  AgentPerformanceMetrics,
  RecentJob,
  MetricType,
  TimeRange,
  Resolution,
  QueueDepthSnapshot,
} from './types';

export class MetricsCollector {
  /**
   * Collect current system metrics from all sources
   */
  async collectCurrentMetrics(userId: string): Promise<SystemMetrics> {
    const [
      queueMetrics,
      agentStatuses,
      errorRate,
      dlqCount,
      throughput,
      tokensPerMinute,
      avgDuration,
      alertCounts,
    ] = await Promise.all([
      this.getQueueMetrics(userId),
      this.getAgentStatuses(userId),
      this.calculateErrorRate(userId, 5),
      this.getDLQCount(userId),
      this.calculateThroughput(userId, 5),
      this.calculateTokensPerMinute(userId, 5),
      this.calculateAvgDuration(userId, 60),
      this.getAlertCounts(userId),
    ]);

    const health = this.calculateHealthScore(queueMetrics, errorRate, agentStatuses.length);

    return {
      health,
      agents: {
        total: agentStatuses.length,
        active: agentStatuses.filter(a => a.status === 'active').length,
        idle: agentStatuses.filter(a => a.status === 'idle').length,
        failed: agentStatuses.filter(a => a.status === 'failed').length,
        breakdown: agentStatuses,
      },
      queue: {
        depth: queueMetrics.waiting + queueMetrics.active,
        active: queueMetrics.active,
        waiting: queueMetrics.waiting,
        failed: queueMetrics.failed,
        delayed: queueMetrics.delayed,
        throughput,
      },
      errors: {
        rate: errorRate,
        recentCount: queueMetrics.failed,
        dlqCount,
      },
      resources: {
        tokensPerMinute,
        avgDurationMs: avgDuration,
        concurrency: queueMetrics.active,
      },
      alerts: alertCounts,
    };
  }

  /**
   * Get queue metrics from BullMQ
   */
  private async getQueueMetrics(userId: string): Promise<QueueDepthSnapshot> {
    // Get metrics from all queues (missions, agents, webhooks, system)
    const queues = ['missions', 'agents', 'webhooks', 'system'];
    const allMetrics = await Promise.all(
      queues.map(queue => taskQueue.getQueueMetrics(queue))
    );

    // Aggregate metrics across all queues
    return allMetrics.reduce(
      (acc, metrics) => ({
        waiting: acc.waiting + metrics.waiting,
        active: acc.active + metrics.active,
        completed: acc.completed + metrics.completed,
        failed: acc.failed + metrics.failed,
        delayed: acc.delayed + metrics.delayed,
      }),
      { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
    );
  }

  /**
   * Get agent statuses from database
   */
  async getAgentStatuses(userId: string): Promise<AgentStatusBreakdown[]> {
    const statuses = await prisma.agentStatus.findMany({
      where: { userId },
      select: {
        agentName: true,
        status: true,
        lastActiveAt: true,
        currentJobId: true,
        consecutiveFailures: true,
      },
    });

    return statuses.map(s => ({
      agentName: s.agentName,
      status: s.status as 'idle' | 'active' | 'failed' | 'unknown',
      lastActiveAt: s.lastActiveAt.toISOString(),
      currentJobId: s.currentJobId || undefined,
      consecutiveFailures: s.consecutiveFailures,
    }));
  }

  /**
   * Calculate error rate over time window
   */
  async calculateErrorRate(userId: string, windowMinutes: number): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const [totalJobs, failedJobs] = await Promise.all([
      prisma.queueJob.count({
        where: {
          userId,
          createdAt: { gte: since },
          status: { in: ['completed', 'failed'] },
        },
      }),
      prisma.queueJob.count({
        where: {
          userId,
          createdAt: { gte: since },
          status: 'failed',
        },
      }),
    ]);

    return totalJobs > 0 ? failedJobs / totalJobs : 0;
  }

  /**
   * Get dead letter queue count
   */
  private async getDLQCount(userId: string): Promise<number> {
    return prisma.deadLetterEntry.count({
      where: {
        userId,
        resolvedAt: null,
      },
    });
  }

  /**
   * Calculate throughput (jobs/minute)
   */
  async calculateThroughput(userId: string, windowMinutes: number): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const completedJobs = await prisma.queueJob.count({
      where: {
        userId,
        completedAt: { gte: since },
        status: 'completed',
      },
    });

    return completedJobs / windowMinutes;
  }

  /**
   * Calculate tokens per minute from recent missions
   */
  private async calculateTokensPerMinute(userId: string, windowMinutes: number): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const missions = await prisma.mission.findMany({
      where: {
        userId,
        updatedAt: { gte: since },
        status: 'COMPLETED',
        agentCosts: { not: prisma.DbNull },
      },
      select: { agentCosts: true },
    });

    let totalTokens = 0;
    for (const mission of missions) {
      if (mission.agentCosts && typeof mission.agentCosts === 'object') {
        const costs = mission.agentCosts as Record<string, any>;
        for (const agent of Object.values(costs)) {
          if (agent && typeof agent === 'object' && 'tokens' in agent) {
            totalTokens += Number(agent.tokens) || 0;
          }
        }
      }
    }

    return totalTokens / windowMinutes;
  }

  /**
   * Calculate average job duration
   */
  private async calculateAvgDuration(userId: string, windowMinutes: number): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const jobs = await prisma.queueJob.findMany({
      where: {
        userId,
        completedAt: { gte: since },
        status: 'completed',
        startedAt: { not: null },
      },
      select: { startedAt: true, completedAt: true },
    });

    if (jobs.length === 0) return 0;

    const totalDuration = jobs.reduce((sum, job) => {
      if (job.startedAt && job.completedAt) {
        return sum + (job.completedAt.getTime() - job.startedAt.getTime());
      }
      return sum;
    }, 0);

    return totalDuration / jobs.length;
  }

  /**
   * Get alert counts
   */
  private async getAlertCounts(userId: string) {
    const [firingCount, resolvedCount, recentFirings] = await Promise.all([
      prisma.alertRule.count({
        where: { userId, isFiring: true },
      }),
      prisma.alertFiring.count({
        where: { userId, resolvedAt: { not: null } },
      }),
      prisma.alertFiring.findMany({
        where: { userId },
        include: { rule: { select: { name: true } } },
        orderBy: { triggeredAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      firing: firingCount,
      resolved: resolvedCount,
      recent: recentFirings.map(f => ({
        id: f.id,
        name: f.rule.name,
        triggeredAt: f.triggeredAt.toISOString(),
        severity: (f.metricValue > 0.5 ? 'critical' : f.metricValue > 0.2 ? 'warning' : 'info') as 'info' | 'warning' | 'critical',
        message: f.message,
      })),
    };
  }

  /**
   * Calculate system health score (0-100)
   */
  private calculateHealthScore(
    queueMetrics: QueueDepthSnapshot,
    errorRate: number,
    agentCount: number
  ): { status: 'healthy' | 'degraded' | 'unhealthy'; score: number; uptime: number } {
    let score = 100;

    // Deduct points for high error rate
    score -= errorRate * 50; // 10% error = -5 points, 100% error = -50 points

    // Deduct points for queue backlog
    const queueDepth = queueMetrics.waiting + queueMetrics.active;
    if (queueDepth > 100) score -= 10;
    else if (queueDepth > 50) score -= 5;

    // Deduct points for failed jobs
    if (queueMetrics.failed > 10) score -= 10;
    else if (queueMetrics.failed > 5) score -= 5;

    // Deduct points for no agents
    if (agentCount === 0) score -= 20;

    score = Math.max(0, Math.min(100, score));

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (score >= 80) status = 'healthy';
    else if (score >= 50) status = 'degraded';
    else status = 'unhealthy';

    return {
      status,
      score: Math.round(score),
      uptime: process.uptime() * 1000, // milliseconds
    };
  }

  /**
   * Get detailed agent status with performance metrics
   */
  async getAgentStatusDetail(userId: string): Promise<AgentStatusDetail[]> {
    const statuses = await prisma.agentStatus.findMany({
      where: { userId },
    });

    const agentDetails = await Promise.all(
      statuses.map(async (status) => {
        // Get recent jobs for this agent
        const recentJobs = await prisma.queueJob.findMany({
          where: {
            userId,
            queue: 'agents',
            payload: {
              path: ['agentName'],
              equals: status.agentName,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            error: true,
          },
        });

        const successRate =
          status.totalExecutions > 0
            ? (status.totalExecutions - status.consecutiveFailures) / status.totalExecutions
            : 0;

        return {
          agentName: status.agentName,
          status: status.status as 'idle' | 'active' | 'failed' | 'unknown',
          currentJobId: status.currentJobId || undefined,
          startedAt: status.startedAt?.toISOString(),
          lastActiveAt: status.lastActiveAt.toISOString(),
          metrics: {
            totalExecutions: status.totalExecutions,
            consecutiveFailures: status.consecutiveFailures,
            avgDurationMs: status.avgDuration,
            successRate,
          } as AgentPerformanceMetrics,
          recentJobs: recentJobs.map(
            (job) =>
              ({
                id: job.id,
                status: job.status === 'completed' ? 'completed' : 'failed',
                duration:
                  job.startedAt && job.completedAt
                    ? job.completedAt.getTime() - job.startedAt.getTime()
                    : 0,
                startedAt: job.startedAt?.toISOString() || '',
                completedAt: job.completedAt?.toISOString(),
                error: job.error || undefined,
              } as RecentJob)
          ),
        };
      })
    );

    return agentDetails;
  }

  /**
   * Create a metric snapshot for time-series data
   */
  async snapshotMetrics(userId: string): Promise<void> {
    const timestamp = new Date();
    // Round to nearest minute
    timestamp.setSeconds(0, 0);

    const metrics = await this.collectCurrentMetrics(userId);

    await prisma.metricSnapshot.upsert({
      where: {
        timestamp_userId: {
          timestamp,
          userId,
        },
      },
      update: {
        queueDepth: metrics.queue.depth,
        activeJobs: metrics.queue.active,
        failedJobs: metrics.queue.failed,
        completedJobs: 0, // TODO: Track completed in window
        activeAgents: metrics.agents.active,
        idleAgents: metrics.agents.idle,
        jobsPerMinute: metrics.queue.throughput,
        costPerHour: 0, // TODO: Calculate from cost telemetry
        tokensPerMinute: metrics.resources.tokensPerMinute,
        errorRate: metrics.errors.rate,
      },
      create: {
        timestamp,
        userId,
        queueDepth: metrics.queue.depth,
        activeJobs: metrics.queue.active,
        failedJobs: metrics.queue.failed,
        completedJobs: 0,
        activeAgents: metrics.agents.active,
        idleAgents: metrics.agents.idle,
        jobsPerMinute: metrics.queue.throughput,
        costPerHour: 0,
        tokensPerMinute: metrics.resources.tokensPerMinute,
        errorRate: metrics.errors.rate,
      },
    });
  }

  /**
   * Get time-series data for a specific metric
   */
  async getTimeSeriesData(
    userId: string,
    metric: MetricType,
    timeRange: TimeRange,
    resolution: Resolution
  ): Promise<{ dataPoints: DataPoint[]; aggregates: any }> {
    // Calculate time window
    const now = new Date();
    const rangeMs = this.parseTimeRange(timeRange);
    const since = new Date(now.getTime() - rangeMs);

    // Query snapshots
    const snapshots = await prisma.metricSnapshot.findMany({
      where: {
        userId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Extract data points based on metric type
    const dataPoints: DataPoint[] = snapshots.map((s) => ({
      timestamp: s.timestamp.toISOString(),
      value: this.extractMetricValue(s, metric),
    }));

    // Calculate aggregates
    const values = dataPoints.map((d) => d.value);
    const aggregates = {
      min: Math.min(...values, 0),
      max: Math.max(...values, 0),
      avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      current: values[values.length - 1] || 0,
    };

    return { dataPoints, aggregates };
  }

  private parseTimeRange(range: TimeRange): number {
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;
    switch (range) {
      case '1h':
        return hour;
      case '6h':
        return 6 * hour;
      case '24h':
        return day;
      case '7d':
        return 7 * day;
      case '30d':
        return 30 * day;
    }
  }

  private extractMetricValue(snapshot: any, metric: MetricType): number {
    switch (metric) {
      case 'queue_depth':
        return snapshot.queueDepth;
      case 'throughput':
        return snapshot.jobsPerMinute;
      case 'error_rate':
        return snapshot.errorRate;
      case 'cost_per_hour':
        return snapshot.costPerHour;
      case 'tokens_per_minute':
        return snapshot.tokensPerMinute;
      case 'active_agents':
        return snapshot.activeAgents;
      default:
        return 0;
    }
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
