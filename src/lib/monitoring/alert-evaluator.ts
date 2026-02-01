/**
 * Phase 9.2: Alert Evaluator
 *
 * Evaluates alert rules against current metrics and triggers notifications
 * when thresholds are breached.
 */

import prisma from '@/prisma';
import { metricsCollector } from './metrics-collector';
import type { AlertRuleConfig, AlertEvaluationResult, MetricType } from './types';

export interface BudgetAlertConfig {
  /** Threshold percentage (0-100) for budget usage warning */
  warningThreshold: number;
  /** Threshold percentage (0-100) for budget usage critical */
  criticalThreshold: number;
  /** Daily spend limit in credits */
  dailySpendLimit?: number;
  /** Enable notifications */
  notificationsEnabled: boolean;
  /** Notification channels */
  channels: ('email' | 'webhook' | 'in_app')[];
}

export interface AlertEvaluatorResult {
  rulesEvaluated: number;
  alertsFired: number;
  alertsResolved: number;
  results: {
    ruleId: string;
    ruleName: string;
    fired: boolean;
    value: number;
    threshold: number;
    message: string;
  }[];
}

export class AlertEvaluator {
  /**
   * Evaluate all active alert rules for a user.
   */
  async evaluateRules(userId: string): Promise<AlertEvaluatorResult> {
    const rules = await prisma.alertRule.findMany({
      where: { userId, isActive: true },
    });

    const results: AlertEvaluatorResult['results'] = [];
    let alertsFired = 0;
    let alertsResolved = 0;

    // Get current metrics
    const metrics = await metricsCollector.collectCurrentMetrics(userId);

    for (const rule of rules) {
      const evaluation = this.evaluateRule(rule, metrics);

      if (evaluation.shouldFire && !rule.isFiring) {
        // Trigger new alert
        await this.fireAlert(rule, evaluation);
        alertsFired++;
      } else if (!evaluation.shouldFire && rule.isFiring) {
        // Resolve existing alert
        await this.resolveAlert(rule);
        alertsResolved++;
      }

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        fired: evaluation.shouldFire,
        value: evaluation.metricValue,
        threshold: rule.threshold,
        message: evaluation.message,
      });
    }

    return {
      rulesEvaluated: rules.length,
      alertsFired,
      alertsResolved,
      results,
    };
  }

  /**
   * Evaluate a single rule against current metrics.
   */
  private evaluateRule(
    rule: { metric: string; condition: string; threshold: number },
    metrics: any,
  ): AlertEvaluationResult {
    const value = this.extractMetricValue(rule.metric, metrics);
    const shouldFire = this.checkCondition(value, rule.condition, rule.threshold);

    return {
      shouldFire,
      metricValue: value,
      message: shouldFire
        ? `${rule.metric} is ${value} (${rule.condition} ${rule.threshold})`
        : `${rule.metric} is ${value} (within threshold)`,
    };
  }

  /**
   * Extract metric value from collected metrics.
   */
  private extractMetricValue(metric: string, metrics: any): number {
    switch (metric) {
      case 'error_rate':
        return metrics.errors?.rate ?? 0;
      case 'queue_depth':
        return metrics.queue?.depth ?? 0;
      case 'cost_per_hour':
        return metrics.resources?.costPerHour ?? 0;
      case 'tokens_per_minute':
        return metrics.resources?.tokensPerMinute ?? 0;
      case 'throughput':
        return metrics.queue?.throughput ?? 0;
      case 'active_agents':
        return metrics.agents?.active ?? 0;
      case 'budget_usage':
        return this.calculateBudgetUsage(metrics);
      default:
        return 0;
    }
  }

  /**
   * Calculate budget usage percentage (requires wallet data).
   */
  private calculateBudgetUsage(_metrics: any): number {
    // This will be populated from telemetry costs API data
    return 0;
  }

  /**
   * Check if condition is met.
   */
  private checkCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt':
        return value > threshold;
      case 'gte':
        return value >= threshold;
      case 'lt':
        return value < threshold;
      case 'lte':
        return value <= threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Fire an alert.
   */
  private async fireAlert(
    rule: { id: string; name: string; channels: string[]; webhookIds: string[]; userId: string },
    evaluation: AlertEvaluationResult,
  ): Promise<void> {
    // Update rule state
    await prisma.alertRule.update({
      where: { id: rule.id },
      data: { isFiring: true, lastFiredAt: new Date() },
    });

    // Create firing record
    await prisma.alertFiring.create({
      data: {
        ruleId: rule.id,
        userId: rule.userId,
        metricValue: evaluation.metricValue,
        message: evaluation.message,
        notificationsSent: [],
      },
    });

    // Send notifications
    await this.sendNotifications(rule, evaluation);
  }

  /**
   * Resolve an alert.
   */
  private async resolveAlert(rule: { id: string }): Promise<void> {
    // Update rule state
    await prisma.alertRule.update({
      where: { id: rule.id },
      data: { isFiring: false },
    });

    // Mark firing as resolved
    await prisma.alertFiring.updateMany({
      where: { ruleId: rule.id, resolvedAt: null },
      data: { resolvedAt: new Date() },
    });
  }

  /**
   * Send notifications via configured channels.
   */
  private async sendNotifications(
    rule: { channels: string[]; webhookIds: string[]; name: string },
    evaluation: AlertEvaluationResult,
  ): Promise<void> {
    for (const channel of rule.channels) {
      try {
        switch (channel) {
          case 'webhook':
            await this.sendWebhookNotifications(rule.webhookIds, rule.name, evaluation);
            break;
          case 'email':
            // Email notification (requires email service integration)
            console.log(
              `[AlertEvaluator] Email notification for ${rule.name}: ${evaluation.message}`,
            );
            break;
          case 'in_app':
            // In-app notification (stored in database, shown in UI)
            console.log(
              `[AlertEvaluator] In-app notification for ${rule.name}: ${evaluation.message}`,
            );
            break;
        }
      } catch (err: any) {
        console.error(`[AlertEvaluator] Failed to send ${channel} notification:`, err.message);
      }
    }
  }

  /**
   * Send webhook notifications.
   */
  private async sendWebhookNotifications(
    webhookIds: string[],
    ruleName: string,
    evaluation: AlertEvaluationResult,
  ): Promise<void> {
    for (const webhookId of webhookIds) {
      const webhook = await prisma.webhookEndpoint.findUnique({
        where: { id: webhookId },
      });

      if (webhook?.isActive) {
        try {
          await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'alert.fired',
              rule: ruleName,
              value: evaluation.metricValue,
              message: evaluation.message,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (err: any) {
          console.error(`[AlertEvaluator] Webhook ${webhookId} failed:`, err.message);
        }
      }
    }
  }

  /**
   * Create a budget alert rule for a user.
   */
  async createBudgetAlertRule(
    userId: string,
    config: BudgetAlertConfig,
  ): Promise<{ id: string; name: string }> {
    const rule = await prisma.alertRule.create({
      data: {
        name: 'Budget Usage Alert',
        description: `Alert when budget usage exceeds ${config.warningThreshold}%`,
        ruleType: 'threshold',
        metric: 'budget_usage',
        condition: 'gte',
        threshold: config.warningThreshold,
        windowMinutes: 60,
        channels: config.channels,
        webhookIds: [],
        isActive: config.notificationsEnabled,
        userId,
      },
    });

    return { id: rule.id, name: rule.name };
  }

  /**
   * Evaluate budget-specific alerts.
   */
  async evaluateBudgetAlerts(
    userId: string,
    currentSpend: number,
    walletBalance: number,
  ): Promise<{
    alerts: { level: 'warning' | 'critical'; message: string }[];
    budgetUsage: number;
  }> {
    const alerts: { level: 'warning' | 'critical'; message: string }[] = [];
    const budgetUsage =
      walletBalance > 0 ? Math.round((currentSpend / (currentSpend + walletBalance)) * 100) : 0;

    // Check for budget rules
    const rules = await prisma.alertRule.findMany({
      where: {
        userId,
        isActive: true,
        metric: 'budget_usage',
      },
    });

    for (const rule of rules) {
      if (budgetUsage >= rule.threshold) {
        alerts.push({
          level: rule.threshold >= 90 ? 'critical' : 'warning',
          message: `Budget usage at ${budgetUsage}% (threshold: ${rule.threshold}%)`,
        });

        // Fire alert if not already firing
        if (!rule.isFiring) {
          await this.fireAlert(rule, {
            shouldFire: true,
            metricValue: budgetUsage,
            message: `Budget usage at ${budgetUsage}%`,
          });
        }
      }
    }

    // Default alerts if no rules configured
    if (rules.length === 0) {
      if (budgetUsage >= 90) {
        alerts.push({
          level: 'critical',
          message: `Critical: Budget usage at ${budgetUsage}%`,
        });
      } else if (budgetUsage >= 80) {
        alerts.push({
          level: 'warning',
          message: `Warning: Budget usage at ${budgetUsage}%`,
        });
      }
    }

    return { alerts, budgetUsage };
  }
}

export const alertEvaluator = new AlertEvaluator();
