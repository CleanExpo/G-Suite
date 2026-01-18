"use client"

import { useState, useEffect } from "react";
import { Activity, Globe, Zap, ShieldCheck, BarChart3, Search } from "lucide-react";
import { motion } from "framer-motion";

export function TelemetryPanel() {
    const [status, setStatus] = useState("SYNCING");

    useEffect(() => {
        const timer = setTimeout(() => setStatus("ONLINE"), 1500);
        return () => clearTimeout(timer);
    }, []);

    const metrics = [
        { label: "Search Dominance", value: "84%", icon: Globe, color: "text-blue-600" },
        { label: "Core Web Vitals", value: "98/100", icon: Zap, color: "text-amber-500" },
        { label: "Vault Integrity", value: "AES-256", icon: ShieldCheck, color: "text-emerald-500" },
        { label: "Conversion Lift", value: "+12.4%", icon: BarChart3, color: "text-purple-500" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, idx) => (
                <motion.div
                    key={m.label}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm group hover:shadow-xl transition-all"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 ${m.color}`}>
                            <m.icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-emerald-500">Live</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{m.label}</p>
                        <p className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white leading-none capitalize">{m.value}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
