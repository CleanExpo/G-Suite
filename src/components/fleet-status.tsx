'use client';

import { Rocket, Shield, Globe, Zap, Cpu, ShoppingCart, Share2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getFleetStats } from '@/actions/mission-history';
import { useTranslations } from 'next-intl';

export function FleetStatus() {
  const [stats, setStats] = useState({
    totalMissions: 0,
    successRate: 100,
    totalFuelConsumed: 0,
    activeAgents: 5,
  });
  const t = useTranslations('FleetStatus');

  useEffect(() => {
    getFleetStats().then(setStats);
  }, []);

  const systems = [
    {
      name: t('systems.architect'),
      status: t('statuses.ready'),
      icon: Cpu,
      color: 'text-blue-600',
    },
    {
      name: t('systems.executor'),
      status: t('statuses.standby'),
      icon: Rocket,
      color: 'text-amber-500',
    },
    {
      name: t('systems.vault'),
      status: t('statuses.encrypted'),
      icon: Shield,
      color: 'text-emerald-500',
    },
    {
      name: t('systems.mirror'),
      status: t('statuses.synced'),
      icon: Globe,
      color: 'text-indigo-500',
    },
    {
      name: t('systems.commerce'),
      status: t('statuses.active'),
      icon: ShoppingCart,
      color: 'text-rose-500',
    },
    {
      name: t('systems.social'),
      status: t('statuses.linked'),
      icon: Share2,
      color: 'text-sky-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#161b22] p-12 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            {t('title')}
          </h3>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
            {t('subtitle')}
          </h2>
        </div>

        {/* Real Metrics */}
        <div className="flex gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {t('totalMissions')}
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {stats.totalMissions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {t('successRate')}
            </p>
            <p className="text-2xl font-black text-emerald-500 leading-none">
              {stats.successRate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {t('fuelConsumed')}
            </p>
            <p className="text-2xl font-black text-blue-600 leading-none">
              {stats.totalFuelConsumed} PTS
            </p>
          </div>
        </div>
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
        <span>{t('version')}</span>
        <span className="text-blue-600 italic">{t('meshStable')}</span>
      </div>
    </div>
  );
}
