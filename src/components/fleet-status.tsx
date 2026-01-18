'use client';

import { Rocket, Shield, Globe, Zap, Cpu, ShoppingCart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function FleetStatus() {
  const systems = [
    { name: 'Architect', status: 'READY', icon: Cpu, color: 'text-blue-600' },
    { name: 'Executor', status: 'STANDBY', icon: Rocket, color: 'text-amber-500' },
    { name: 'The Vault', status: 'ENCRYPTED', icon: Shield, color: 'text-emerald-500' },
    { name: 'The Mirror', status: 'SYNCED', icon: Globe, color: 'text-indigo-500' },
    { name: 'Commerce', status: 'ACTIVE', icon: ShoppingCart, color: 'text-rose-500' },
    { name: 'Social Swarm', status: 'LINKED', icon: Share2, color: 'text-sky-500' },
  ];

  return (
    <div className="bg-white dark:bg-[#161b22] p-12 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-10">
      <div>
        <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          Fleet Operational Status
        </h3>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
          System Readiness
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((s, idx) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl group hover:border-blue-600/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white dark:bg-white/5 shadow-sm ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm dark:text-white">{s.name}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {s.status}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
        <span>Orchestrator Version: v9.42</span>
        <span className="text-blue-600 italic">Global Mesh Stable</span>
      </div>
    </div>
  );
}
