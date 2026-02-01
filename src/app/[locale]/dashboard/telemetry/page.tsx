'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Wallet,
  Cpu,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

interface AgentBreakdown {
  agentName: string;
  totalCost: number;
  totalTokens: number;
  avgDuration: number;
  executionCount: number;
}

interface RecentMission {
  id: string;
  status: string;
  totalCost: number;
  agentCosts: Record<
    string,
    { agentName: string; tokens: number; cost: number; duration: number; success: boolean }
  > | null;
  createdAt: string;
}

interface CostTrendEntry {
  date: string;
  totalCost: number;
  missionCount: number;
}

interface TelemetryData {
  summary: {
    totalSpent: number;
    walletBalance: number;
    avgCostPerMission: number;
    budgetUsage: number;
    budgetAlert: boolean;
    missionCount: number;
  };
  agentBreakdown: AgentBreakdown[];
  recentMissions: RecentMission[];
  costTrend: CostTrendEntry[];
}

export default function TelemetryPage() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry/costs');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // API not reachable — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = data?.summary;
  const agents = data?.agentBreakdown ?? [];
  const recentMissions = data?.recentMissions ?? [];
  const costTrend = data?.costTrend ?? [];
  const maxDailyCost = Math.max(...costTrend.map((d) => d.totalCost), 1);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-800">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
              Cost Telemetry
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-gray-500 font-medium">
                Per-Agent Cost Attribution & Budget Analysis
              </p>
              {summary?.budgetAlert && (
                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" /> Budget Alert
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            label="Total Spent"
            value={`${summary?.totalSpent ?? 0}`}
            unit="PTS"
            icon={Zap}
            color="text-blue-600"
            loading={loading}
          />
          <SummaryCard
            label="Balance"
            value={`${summary?.walletBalance ?? 0}`}
            unit="PTS"
            icon={Wallet}
            color="text-emerald-500"
            loading={loading}
          />
          <SummaryCard
            label="Avg / Mission"
            value={`${summary?.avgCostPerMission ?? 0}`}
            unit="PTS"
            icon={Cpu}
            color="text-purple-500"
            loading={loading}
          />
          <SummaryCard
            label="Budget Usage"
            value={`${summary?.budgetUsage ?? 0}`}
            unit="%"
            icon={TrendingUp}
            color={(summary?.budgetUsage ?? 0) > 80 ? 'text-amber-500' : 'text-emerald-500'}
            loading={loading}
          />
        </div>

        {/* Cost Trend Chart */}
        {costTrend.length > 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
              <h3 className="text-gray-900 dark:text-white font-black italic uppercase tracking-tighter text-xl">
                Daily Cost Trend
              </h3>
            </div>
            <div className="px-8 py-8">
              <div className="flex items-end gap-2 h-40">
                {costTrend.slice(-14).map((day) => {
                  const height = Math.max((day.totalCost / maxDailyCost) * 100, 4);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[9px] font-mono text-gray-400">{day.totalCost}</span>
                      <div
                        className="w-full bg-blue-600 rounded-t-lg transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[8px] font-mono text-gray-400 truncate w-full text-center">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Agent Cost Breakdown */}
        <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex items-center gap-3">
            <Activity className="w-5 h-5 text-gray-400" />
            <h3 className="text-gray-900 dark:text-white font-black italic uppercase tracking-tighter text-xl">
              Agent Cost Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    Agent
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">
                    Total Cost
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">
                    Tokens
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">
                    Avg Duration
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">
                    Executions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-6 text-gray-400 text-sm">
                      Loading telemetry...
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 text-sm">
                      No agent cost data yet. Deploy a mission to start tracking.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr
                      key={agent.agentName}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <span className="font-bold text-gray-900 dark:text-white">
                            {agent.agentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {agent.totalCost} <span className="text-xs text-gray-400">PTS</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-mono text-gray-500">
                          {agent.totalTokens.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-mono text-gray-500">
                          {(agent.avgDuration / 1000).toFixed(1)}s
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                          {agent.executionCount}x
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Mission Costs */}
        {recentMissions.length > 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-gray-900 dark:text-white font-black italic uppercase tracking-tighter text-xl">
                Recent Mission Costs
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {recentMissions.map((mission) => {
                const agentEntries = mission.agentCosts ? Object.values(mission.agentCosts) : [];
                return (
                  <div
                    key={mission.id}
                    className="px-8 py-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                          {mission.id.slice(0, 8)}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            mission.status === 'COMPLETED'
                              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'
                              : mission.status === 'FAILED'
                                ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                                : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                          }`}
                        >
                          {mission.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          {mission.totalCost} PTS
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {new Date(mission.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {agentEntries.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {agentEntries.map((entry) => (
                          <span
                            key={entry.agentName}
                            className="text-[9px] font-mono px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-100 dark:border-white/10"
                          >
                            {entry.agentName}: {entry.cost}pts / {entry.tokens}tok /{' '}
                            {(entry.duration / 1000).toFixed(1)}s
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Summary Card Component ─────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div
          className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        {loading ? (
          <p className="text-2xl font-black text-gray-300 dark:text-gray-600 animate-pulse">---</p>
        ) : (
          <p className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white leading-none">
            {value}
            <span className="text-lg ml-1 text-gray-400">{unit}</span>
          </p>
        )}
      </div>
    </div>
  );
}
