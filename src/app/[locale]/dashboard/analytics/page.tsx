'use client';

/**
 * Analytics Dashboard
 * 
 * Comprehensive analytics and attribution modeling dashboard
 * powered by Google Analytics 4 Data API.
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type {
    AnalyticsOverview,
    CampaignMetrics,
    ChannelPerformance,
    AttributionResult,
    AttributionModel
} from '@/lib/analytics/types';

export default function AnalyticsDashboardPage() {
    const t = useTranslations('Dashboard');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState(28);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [channels, setChannels] = useState<ChannelPerformance[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignMetrics[]>([]);
    const [attribution, setAttribution] = useState<AttributionResult[]>([]);
    const [selectedModel, setSelectedModel] = useState<AttributionModel>('last_click');

    useEffect(() => {
        loadData();
    }, [dateRange]);

    useEffect(() => {
        loadAttribution();
    }, [selectedModel]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch overview and campaigns in parallel
            const [overviewRes, campaignsRes] = await Promise.all([
                fetch(`/api/analytics/overview?days=${dateRange}`),
                fetch(`/api/analytics/campaigns?days=${dateRange}`),
            ]);

            const overviewData = await overviewRes.json();
            const campaignsData = await campaignsRes.json();

            if (overviewData.success) {
                setOverview(overviewData.data.overview);
                setChannels(overviewData.data.channels || []);
            }

            if (campaignsData.success) {
                setCampaigns(campaignsData.data.campaigns || []);
            }

            await loadAttribution();
        } catch (err: any) {
            setError(err.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const loadAttribution = async () => {
        try {
            const res = await fetch('/api/analytics/attribution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: selectedModel, days: dateRange }),
            });

            const data = await res.json();
            if (data.success) {
                setAttribution(data.data.results || []);
            }
        } catch (err) {
            console.error('Attribution load error:', err);
        }
    };

    const formatNumber = (num: number) => num.toLocaleString();
    const formatCurrency = (num: number) => `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Analytics & Attribution
                        </h1>
                        <p className="text-slate-400">
                            Campaign performance and multi-touch attribution powered by GA4
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(parseInt(e.target.value))}
                            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={28}>Last 28 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* KPI Cards */}
                {overview && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard
                            title="Sessions"
                            value={formatNumber(overview.sessions)}
                            icon="📊"
                            color="blue"
                        />
                        <KPICard
                            title="Users"
                            value={formatNumber(overview.users)}
                            subtitle={`${formatNumber(overview.newUsers)} new`}
                            icon="👥"
                            color="green"
                        />
                        <KPICard
                            title="Conversions"
                            value={formatNumber(overview.conversions)}
                            subtitle={formatPercent((overview.conversions / overview.sessions) * 100)}
                            icon="🎯"
                            color="purple"
                        />
                        <KPICard
                            title="Revenue"
                            value={formatCurrency(overview.revenue)}
                            icon="💰"
                            color="yellow"
                        />
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Channel Performance */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Channel Performance</h2>
                        <div className="space-y-4">
                            {channels.map((channel, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ChannelIcon channel={channel.channel} />
                                        <span className="text-white capitalize">
                                            {channel.channel.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <span className="text-slate-400">
                                            {formatNumber(channel.sessions)} sessions
                                        </span>
                                        <span className="text-green-400">
                                            {formatNumber(channel.conversions)} conv
                                        </span>
                                        <span className="text-yellow-400">
                                            {formatCurrency(channel.revenue)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attribution Model */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Attribution Model</h2>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value as AttributionModel)}
                                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1 text-sm"
                            >
                                <option value="last_click">Last Click</option>
                                <option value="first_click">First Click</option>
                                <option value="linear">Linear</option>
                                <option value="time_decay">Time Decay</option>
                                <option value="position_based">Position Based</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            {attribution.slice(0, 6).map((result, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-white text-sm">
                                            {result.source}/{result.medium}
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(result.contributionPercentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-white text-sm">
                                            {formatCurrency(result.attributedRevenue)}
                                        </div>
                                        <div className="text-slate-400 text-xs">
                                            {formatPercent(result.contributionPercentage)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Campaign Table */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Campaign Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Campaign</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Source / Medium</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Sessions</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Users</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Conversions</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign, idx) => (
                                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                        <td className="py-3 px-4 text-white">{campaign.campaignName}</td>
                                        <td className="py-3 px-4 text-slate-300">
                                            {campaign.source} / {campaign.medium}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white">
                                            {formatNumber(campaign.sessions)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white">
                                            {formatNumber(campaign.users)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-green-400">
                                            {formatNumber(campaign.conversions)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-yellow-400">
                                            {formatCurrency(campaign.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function KPICard({
    title,
    value,
    subtitle,
    icon,
    color
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
    const gradients = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${gradients[color]} border backdrop-blur rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">{title}</span>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
            {subtitle && <div className="text-sm text-slate-400 mt-1">{subtitle}</div>}
        </div>
    );
}

function ChannelIcon({ channel }: { channel: string }) {
    const icons: Record<string, string> = {
        organic_search: '🔍',
        paid_search: '💳',
        social: '📱',
        email: '📧',
        direct: '🔗',
        referral: '🌐',
        display: '🖼️',
        affiliate: '🤝',
    };
    return <span className="text-xl">{icons[channel] || '📊'}</span>;
}
