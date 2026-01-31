/**
 * Alert Evaluator Tests
 *
 * Phase 9.2: Tests for budget and system metric alerts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/prisma', () => ({
  default: {
    alertRule: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    alertFiring: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    webhookEndpoint: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock metrics collector
vi.mock('@/lib/monitoring/metrics-collector', () => ({
  metricsCollector: {
    collectCurrentMetrics: vi.fn(),
  },
}));

import prisma from '@/prisma';
import { metricsCollector } from '@/lib/monitoring/metrics-collector';
import { AlertEvaluator } from '@/lib/monitoring/alert-evaluator';

describe('AlertEvaluator', () => {
  let evaluator: AlertEvaluator;

  beforeEach(() => {
    vi.clearAllMocks();
    evaluator = new AlertEvaluator();
  });

  describe('evaluateRules', () => {
    it('should evaluate all active rules for a user', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
        {
          id: 'rule_1',
          name: 'High Error Rate',
          ruleType: 'threshold',
          metric: 'error_rate',
          condition: 'gt',
          threshold: 0.1,
          windowMinutes: 5,
          channels: ['in_app'],
          webhookIds: [],
          isActive: true,
          isFiring: false,
          lastFiredAt: null,
          userId: 'user_123',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
      ] as any);

      vi.mocked(metricsCollector.collectCurrentMetrics).mockResolvedValue({
        errors: { rate: 0.05, recentCount: 0, dlqCount: 0 },
        queue: { depth: 0, active: 0, waiting: 0, failed: 0, delayed: 0, throughput: 0 },
        agents: { total: 0, active: 0, idle: 0, failed: 0, breakdown: [] },
        resources: { tokensPerMinute: 0, avgDurationMs: 0, concurrency: 0 },
        alerts: { firing: 0, resolved: 0, recent: [] },
        health: { status: 'healthy', score: 100, uptime: 0 },
      });

      const result = await evaluator.evaluateRules('user_123');

      expect(result.rulesEvaluated).toBe(1);
      expect(result.alertsFired).toBe(0);
      expect(result.results[0].fired).toBe(false);
    });

    it('should fire alert when threshold is breached', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
        {
          id: 'rule_1',
          name: 'High Error Rate',
          ruleType: 'threshold',
          metric: 'error_rate',
          condition: 'gt',
          threshold: 0.1,
          windowMinutes: 5,
          channels: ['in_app'],
          webhookIds: [],
          isActive: true,
          isFiring: false,
          lastFiredAt: null,
          userId: 'user_123',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
      ] as any);

      vi.mocked(metricsCollector.collectCurrentMetrics).mockResolvedValue({
        errors: { rate: 0.25, recentCount: 5, dlqCount: 0 },
        queue: { depth: 0, active: 0, waiting: 0, failed: 0, delayed: 0, throughput: 0 },
        agents: { total: 0, active: 0, idle: 0, failed: 0, breakdown: [] },
        resources: { tokensPerMinute: 0, avgDurationMs: 0, concurrency: 0 },
        alerts: { firing: 0, resolved: 0, recent: [] },
        health: { status: 'healthy', score: 100, uptime: 0 },
      });

      vi.mocked(prisma.alertRule.update).mockResolvedValue({} as any);
      vi.mocked(prisma.alertFiring.create).mockResolvedValue({} as any);

      const result = await evaluator.evaluateRules('user_123');

      expect(result.alertsFired).toBe(1);
      expect(result.results[0].fired).toBe(true);
      expect(prisma.alertRule.update).toHaveBeenCalledWith({
        where: { id: 'rule_1' },
        data: expect.objectContaining({ isFiring: true }),
      });
    });

    it('should resolve alert when metric returns below threshold', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
        {
          id: 'rule_1',
          name: 'High Error Rate',
          ruleType: 'threshold',
          metric: 'error_rate',
          condition: 'gt',
          threshold: 0.1,
          windowMinutes: 5,
          channels: ['in_app'],
          webhookIds: [],
          isActive: true,
          isFiring: true, // Currently firing
          lastFiredAt: new Date(),
          userId: 'user_123',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
        },
      ] as any);

      vi.mocked(metricsCollector.collectCurrentMetrics).mockResolvedValue({
        errors: { rate: 0.02, recentCount: 0, dlqCount: 0 },
        queue: { depth: 0, active: 0, waiting: 0, failed: 0, delayed: 0, throughput: 0 },
        agents: { total: 0, active: 0, idle: 0, failed: 0, breakdown: [] },
        resources: { tokensPerMinute: 0, avgDurationMs: 0, concurrency: 0 },
        alerts: { firing: 0, resolved: 0, recent: [] },
        health: { status: 'healthy', score: 100, uptime: 0 },
      });

      vi.mocked(prisma.alertRule.update).mockResolvedValue({} as any);
      vi.mocked(prisma.alertFiring.updateMany).mockResolvedValue({} as any);

      const result = await evaluator.evaluateRules('user_123');

      expect(result.alertsResolved).toBe(1);
      expect(result.results[0].fired).toBe(false);
      expect(prisma.alertRule.update).toHaveBeenCalledWith({
        where: { id: 'rule_1' },
        data: { isFiring: false },
      });
    });
  });

  describe('evaluateBudgetAlerts', () => {
    it('should return warning when budget usage exceeds 80%', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([]);

      const result = await evaluator.evaluateBudgetAlerts('user_123', 850, 150);

      expect(result.budgetUsage).toBe(85);
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].level).toBe('warning');
    });

    it('should return critical when budget usage exceeds 90%', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([]);

      const result = await evaluator.evaluateBudgetAlerts('user_123', 950, 50);

      expect(result.budgetUsage).toBe(95);
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].level).toBe('critical');
    });

    it('should return no alerts when budget usage is normal', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([]);

      const result = await evaluator.evaluateBudgetAlerts('user_123', 500, 1000);

      expect(result.budgetUsage).toBe(33);
      expect(result.alerts).toHaveLength(0);
    });

    it('should respect custom budget alert rules', async () => {
      vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
        {
          id: 'budget_rule',
          name: 'Custom Budget Alert',
          metric: 'budget_usage',
          threshold: 50,
          channels: ['email'],
          webhookIds: [],
          isActive: true,
          isFiring: false,
          userId: 'user_123',
        },
      ] as any);

      vi.mocked(prisma.alertRule.update).mockResolvedValue({} as any);
      vi.mocked(prisma.alertFiring.create).mockResolvedValue({} as any);

      const result = await evaluator.evaluateBudgetAlerts('user_123', 600, 400);

      expect(result.budgetUsage).toBe(60);
      expect(result.alerts).toHaveLength(1);
    });
  });

  describe('createBudgetAlertRule', () => {
    it('should create a budget alert rule', async () => {
      vi.mocked(prisma.alertRule.create).mockResolvedValue({
        id: 'new_rule',
        name: 'Budget Usage Alert',
      } as any);

      const result = await evaluator.createBudgetAlertRule('user_123', {
        warningThreshold: 80,
        criticalThreshold: 95,
        notificationsEnabled: true,
        channels: ['email', 'webhook'],
      });

      expect(result.id).toBe('new_rule');
      expect(prisma.alertRule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Budget Usage Alert',
          metric: 'budget_usage',
          threshold: 80,
          channels: ['email', 'webhook'],
        }),
      });
    });
  });
});

describe('Alert Conditions', () => {
  let evaluator: AlertEvaluator;

  beforeEach(() => {
    evaluator = new AlertEvaluator();
  });

  it('should handle gt condition', async () => {
    vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
      { id: '1', metric: 'queue_depth', condition: 'gt', threshold: 50, isFiring: false, channels: [], webhookIds: [], userId: 'u' },
    ] as any);

    vi.mocked(metricsCollector.collectCurrentMetrics).mockResolvedValue({
      queue: { depth: 60 },
    } as any);

    vi.mocked(prisma.alertRule.update).mockResolvedValue({} as any);
    vi.mocked(prisma.alertFiring.create).mockResolvedValue({} as any);

    const result = await evaluator.evaluateRules('u');
    expect(result.results[0].fired).toBe(true);
  });

  it('should handle lt condition', async () => {
    vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
      { id: '1', metric: 'throughput', condition: 'lt', threshold: 10, isFiring: false, channels: [], webhookIds: [], userId: 'u' },
    ] as any);

    vi.mocked(metricsCollector.collectCurrentMetrics).mockResolvedValue({
      queue: { throughput: 5 },
    } as any);

    vi.mocked(prisma.alertRule.update).mockResolvedValue({} as any);
    vi.mocked(prisma.alertFiring.create).mockResolvedValue({} as any);

    const result = await evaluator.evaluateRules('u');
    expect(result.results[0].fired).toBe(true);
  });

  it('should handle gte condition', async () => {
    vi.mocked(prisma.alertRule.findMany).mockResolvedValue([
      { id: '1', metric: 'active_agents', condition: 'gte', threshold: 5, isFiring: false, channels: [], webhookIds: [], userId: 'u' },
    ] as any);

    vi.mocked(metricsCollector.collectCurrentMetrics).mockResolvedValue({
      agents: { active: 5 },
    } as any);

    vi.mocked(prisma.alertRule.update).mockResolvedValue({} as any);
    vi.mocked(prisma.alertFiring.create).mockResolvedValue({} as any);

    const result = await evaluator.evaluateRules('u');
    expect(result.results[0].fired).toBe(true);
  });
});
