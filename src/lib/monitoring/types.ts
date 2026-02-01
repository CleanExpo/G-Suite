/**
 * UNI-168: Monitoring Dashboard Types
 *
 * TypeScript types and interfaces for the monitoring system.
 */

// ─── System Metrics ─────────────────────────────────────────────────────────

export interface SystemMetrics {
  health: HealthMetrics;
  agents: AgentMetrics;
  queue: QueueMetrics;
  errors: ErrorMetrics;
  resources: ResourceMetrics;
  alerts: AlertSummary;
}

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  uptime: number; // milliseconds
}

export interface AgentMetrics {
  total: number;
  active: number;
  idle: number;
  failed: number;
  breakdown: AgentStatusBreakdown[];
}

export interface AgentStatusBreakdown {
  agentName: string;
  status: AgentStatusType;
  lastActiveAt: string;
  currentJobId?: string;
  consecutiveFailures?: number;
}

export type AgentStatusType = 'idle' | 'active' | 'failed' | 'unknown';

export interface QueueMetrics {
  depth: number; // total waiting + active
  active: number;
  waiting: number;
  failed: number;
  delayed: number;
  throughput: number; // jobs/minute
}

export interface ErrorMetrics {
  rate: number; // 0.0 - 1.0 (percentage)
  recentCount: number;
  dlqCount: number;
}

export interface ResourceMetrics {
  tokensPerMinute: number;
  avgDurationMs: number;
  concurrency: number; // active jobs
}

export interface AlertSummary {
  firing: number;
  resolved: number;
  recent: RecentAlert[];
}

export interface RecentAlert {
  id: string;
  name: string;
  triggeredAt: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

// ─── Time-Series Data ───────────────────────────────────────────────────────

export interface TimeSeriesData {
  metric: MetricType;
  timeRange: TimeRange;
  resolution: Resolution;
  dataPoints: DataPoint[];
  aggregates: AggregateStats;
}

export type MetricType =
  | 'queue_depth'
  | 'throughput'
  | 'error_rate'
  | 'cost_per_hour'
  | 'tokens_per_minute'
  | 'active_agents';

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';
export type Resolution = '1m' | '5m' | '15m' | '1h' | '1d';

export interface DataPoint {
  timestamp: string; // ISO 8601
  value: number;
}

export interface AggregateStats {
  min: number;
  max: number;
  avg: number;
  current: number;
}

// ─── Agent Status ───────────────────────────────────────────────────────────

export interface AgentStatusDetail {
  agentName: string;
  status: AgentStatusType;
  currentJobId?: string;
  startedAt?: string;
  lastActiveAt: string;
  metrics: AgentPerformanceMetrics;
  recentJobs: RecentJob[];
}

export interface AgentPerformanceMetrics {
  totalExecutions: number;
  consecutiveFailures: number;
  avgDurationMs: number;
  successRate: number; // 0.0 - 1.0
}

export interface RecentJob {
  id: string;
  status: 'completed' | 'failed';
  duration: number; // milliseconds
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// ─── Alert Rules ────────────────────────────────────────────────────────────

export interface AlertRuleConfig {
  name: string;
  description?: string;
  ruleType: AlertRuleType;
  metric: MetricType;
  condition: AlertCondition;
  threshold: number;
  windowMinutes: number;
  channels: AlertChannel[];
  webhookIds: string[];
}

export type AlertRuleType = 'threshold' | 'rate_of_change';
export type AlertCondition = 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
export type AlertChannel = 'webhook' | 'email' | 'slack' | 'sms';

export interface AlertEvaluationResult {
  shouldFire: boolean;
  metricValue: number;
  message: string;
}

export interface AlertFiringRecord {
  id: string;
  ruleName: string;
  triggeredAt: string;
  resolvedAt?: string;
  metricValue: number;
  message: string;
  duration?: number; // milliseconds
  notificationsSent: string[];
}

// ─── Metric Snapshots ───────────────────────────────────────────────────────

export interface MetricSnapshotData {
  timestamp: Date;
  userId: string;

  // Queue metrics
  queueDepth: number;
  activeJobs: number;
  failedJobs: number;
  completedJobs: number;

  // Agent metrics
  activeAgents: number;
  idleAgents: number;

  // Throughput
  jobsPerMinute: number;

  // Cost
  costPerHour: number;
  tokensPerMinute: number;

  // Errors
  errorRate: number;
}

// ─── API Responses ──────────────────────────────────────────────────────────

export interface MonitoringOverviewResponse {
  success: boolean;
  timestamp: string;
  health: HealthMetrics;
  agents: AgentMetrics;
  queue: QueueMetrics;
  errors: ErrorMetrics;
  resources: ResourceMetrics;
  alerts: AlertSummary;
}

export interface MetricsResponse {
  success: boolean;
  metric: MetricType;
  timeRange: TimeRange;
  resolution: Resolution;
  dataPoints: DataPoint[];
  aggregates: AggregateStats;
}

export interface AgentsResponse {
  success: boolean;
  agents: AgentStatusDetail[];
}

export interface AlertRulesResponse {
  success: boolean;
  rules: AlertRuleConfig[];
}

export interface AlertHistoryResponse {
  success: boolean;
  firings: AlertFiringRecord[];
  total: number;
}

// ─── Internal Types ─────────────────────────────────────────────────────────

export interface QueueDepthSnapshot {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface MissionStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  running: number;
}

export interface JobStats {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
}
