'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    components: {
        name: string;
        status: 'healthy' | 'degraded' | 'unhealthy';
        latencyMs?: number;
        message?: string;
    }[];
    agents: {
        total: number;
        ready: number;
        names: string[];
    };
    googleProducts: {
        name: string;
        status: 'connected' | 'degraded' | 'disconnected';
    }[];
}

const statusColors = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    unhealthy: 'bg-red-500',
    connected: 'bg-emerald-500',
    disconnected: 'bg-red-500'
};

const statusTextColors = {
    healthy: 'text-emerald-400',
    degraded: 'text-amber-400',
    unhealthy: 'text-red-400',
    connected: 'text-emerald-400',
    disconnected: 'text-red-400'
};

export default function SystemHealth() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/health');
                if (!res.ok) throw new Error('Failed to fetch health status');
                const data = await res.json();
                setHealth(data);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error || !health) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400">Error: {error || 'Unknown error'}</p>
            </div>
        );
    }

    const formatUptime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const connectedProducts = health.googleProducts.filter(p => p.status === 'connected').length;
    const totalProducts = health.googleProducts.length;

    return (
        <div className="space-y-6">
            {/* Overall Status Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border ${health.status === 'healthy'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : health.status === 'degraded'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${statusColors[health.status]} animate-pulse`} />
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                System {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                            </h2>
                            <p className="text-sm text-white/60">
                                v{health.version} • Uptime: {formatUptime(health.uptime)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-white/60">Last checked</p>
                        <p className="text-white">{new Date(health.timestamp).toLocaleTimeString()}</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                    <p className="text-sm text-white/60 mb-1">Agent Fleet</p>
                    <p className="text-3xl font-bold text-white">{health.agents.ready}/{health.agents.total}</p>
                    <p className="text-sm text-emerald-400">Agents Ready</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                    <p className="text-sm text-white/60 mb-1">Google Products</p>
                    <p className="text-3xl font-bold text-white">{connectedProducts}/{totalProducts}</p>
                    <p className={`text-sm ${connectedProducts === totalProducts ? 'text-emerald-400' : 'text-amber-400'}`}>
                        Connected
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                    <p className="text-sm text-white/60 mb-1">Components</p>
                    <p className="text-3xl font-bold text-white">
                        {health.components.filter(c => c.status === 'healthy').length}/{health.components.length}
                    </p>
                    <p className="text-sm text-emerald-400">Healthy</p>
                </motion.div>
            </div>

            {/* Google Products Grid */}
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Google Product Connections</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {health.googleProducts.map((product, i) => (
                        <motion.div
                            key={product.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={`p-3 rounded-lg border ${product.status === 'connected'
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${statusColors[product.status]}`} />
                                <span className="text-sm text-white truncate">{product.name}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Agent Fleet */}
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Agent Fleet Status</h3>
                <div className="flex flex-wrap gap-2">
                    {health.agents.names.map((name, i) => (
                        <motion.span
                            key={name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.03 * i }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                            {name}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Component Health */}
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">System Components</h3>
                <div className="space-y-3">
                    {health.components.map((component, i) => (
                        <motion.div
                            key={component.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${statusColors[component.status]}`} />
                                <span className="text-white">{component.name}</span>
                            </div>
                            <div className="text-right">
                                <span className={`text-sm ${statusTextColors[component.status]}`}>
                                    {component.status}
                                </span>
                                {component.latencyMs && (
                                    <span className="text-white/40 text-xs ml-2">
                                        {component.latencyMs}ms
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
