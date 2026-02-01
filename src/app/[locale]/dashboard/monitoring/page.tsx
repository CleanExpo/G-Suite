'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Layers,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { SystemMetrics, AgentStatusDetail } from '@/lib/monitoring/types';

export default function MonitoringPage() {
  const [data, setData] = useState<SystemMetrics | null>(null);
  const [agentDetails, setAgentDetails] = useState<AgentStatusDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, agentsRes] = await Promise.all([
        fetch('/api/monitoring/overview'),
        fetch('/api/monitoring/agents'),
      ]);

      const overviewJson = await overviewRes.json();
      const agentsJson = await agentsRes.json();

      if (overviewJson.success) {
        setData(overviewJson);
      }
      if (agentsJson.success) {
        setAgentDetails(agentsJson.agents);
      }
    } catch (error) {
      console.error('[Monitoring Dashboard] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const healthStatus = data?.health.status || 'unknown';
  const healthScore = data?.health.score || 0;
  const queueDepth = data?.queue.depth || 0;
  const errorRate = ((data?.errors.rate || 0) * 100).toFixed(1);
  const activeAgents = data?.agents.active || 0;
  const totalAgents = data?.agents.total || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
                System Monitoring
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-500 font-medium">
                  Real-time Performance & Health Dashboard
                </p>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                    autoRefresh
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-500 border-green-100 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-900/20 text-gray-500 border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <Zap className="w-3 h-3" /> Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-pulse text-gray-400">Loading metrics...</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Health Score */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      healthStatus === 'healthy'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : healthStatus === 'degraded'
                          ? 'bg-amber-50 dark:bg-amber-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <Activity
                      className={`w-5 h-5 ${
                        healthStatus === 'healthy'
                          ? 'text-green-600'
                          : healthStatus === 'degraded'
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
                      Health Score
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {healthScore}/100
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold uppercase tracking-wider ${
                    healthStatus === 'healthy'
                      ? 'text-green-600'
                      : healthStatus === 'degraded'
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {healthStatus}
                </div>
              </div>

              {/* Queue Depth */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
                      Queue Depth
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {queueDepth}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {data?.queue.active || 0} active, {data?.queue.waiting || 0} waiting
                </div>
              </div>

              {/* Error Rate */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
                      Error Rate
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {errorRate}%
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {data?.errors.dlqCount || 0} in dead letter queue
                </div>
              </div>

              {/* Active Agents */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
                      Active Agents
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {activeAgents}/{totalAgents}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-500">{activeAgents} executing</span>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            {data && data.alerts.firing > 0 && (
              <div className="border border-amber-100 dark:border-amber-800 rounded-2xl p-6 bg-amber-50 dark:bg-amber-900/10">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    Active Alerts ({data.alerts.firing})
                  </h2>
                </div>
                <div className="space-y-3">
                  {data.alerts.recent.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white">{alert.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{alert.message}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          Triggered {new Date(alert.triggeredAt).toLocaleString()}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-600'
                            : alert.severity === 'warning'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {alert.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Status Grid */}
            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900/50">
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Cpu className="w-6 h-6 text-blue-500" />
                Agent Status
              </h2>

              {agentDetails.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No agent data available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-3 px-4 text-xs font-black uppercase tracking-widest text-gray-500">
                          Agent
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-black uppercase tracking-widest text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-black uppercase tracking-widest text-gray-500">
                          Last Active
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-black uppercase tracking-widest text-gray-500">
                          Executions
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-black uppercase tracking-widest text-gray-500">
                          Avg Duration
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-black uppercase tracking-widest text-gray-500">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentDetails.map((agent) => {
                        const timeSince = Date.now() - new Date(agent.lastActiveAt).getTime();
                        const minutesSince = Math.floor(timeSince / 60000);
                        const timeString =
                          minutesSince < 1
                            ? 'Just now'
                            : minutesSince < 60
                              ? `${minutesSince}m ago`
                              : `${Math.floor(minutesSince / 60)}h ago`;

                        return (
                          <tr
                            key={agent.agentName}
                            className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                          >
                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                              {agent.agentName}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {agent.status === 'active' ? (
                                  <>
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <span className="text-blue-600 font-bold">Active</span>
                                  </>
                                ) : agent.status === 'failed' ? (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-red-600 font-bold">Failed</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500 font-bold">Idle</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-500 text-sm">{timeString}</td>
                            <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-mono">
                              {agent.metrics.totalExecutions}
                            </td>
                            <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-mono">
                              {(agent.metrics.avgDurationMs / 1000).toFixed(1)}s
                            </td>
                            <td className="py-4 px-4 text-right font-mono">
                              <span
                                className={`${
                                  agent.metrics.successRate >= 0.9
                                    ? 'text-green-600'
                                    : agent.metrics.successRate >= 0.7
                                      ? 'text-amber-600'
                                      : 'text-red-600'
                                } font-bold`}
                              >
                                {(agent.metrics.successRate * 100).toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resource Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Throughput
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {data?.queue.throughput.toFixed(1) || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">jobs/minute</div>
              </div>

              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Tokens/Min
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {Math.round(data?.resources.tokensPerMinute || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">average rate</div>
              </div>

              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Avg Duration
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {((data?.resources.avgDurationMs || 0) / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-gray-500 mt-1">per job</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
