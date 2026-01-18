'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Zap,
  Globe,
  Share2,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';

const MISSION_DEMOS = [
  {
    title: 'The Algorithm Mesh',
    subtitle: 'E-E-A-T & Semantic Mastery',
    description:
      'G-Pilot parses the Google Search Algorithm Mesh in real-time, optimizing your content vectors for maximum rank dominance across LLM search surfaces.',
    image: '/google_algo_mastery_minimalist.png',
    icon: Globe,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    stats: ['+140% Search Visibility', 'SOC2 Secured', 'Lighthouse 100'],
  },
  {
    title: 'Reddit Swarm Distribution',
    subtitle: 'High-Value Social Penetration',
    description:
      'Our executor nodes broadcast high-context marketing payloads to Reddit and X, bypassing traditional ad-fatigue through authentic robotic engagement.',
    image: '/social_media_swarm_minimalist.png',
    icon: MessageSquare,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    stats: ['2.4M Cumulative Impressions', 'Zero Ad-Spend', 'Organic Velocity'],
  },
  {
    title: 'Mission Blueprint results',
    subtitle: 'Quantifiable Marketing Growth',
    description:
      'Every mission results in high-precision blueprints and data-driven slides that demonstrate immediate impact on brand equity and conversion funnels.',
    image: '/marketing_results_minimalist.png',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    stats: ['$12k+ Value per Mission', 'Automated Attribution', 'Live ROI Sync'],
  },
];

export function MissionShowcase() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % MISSION_DEMOS.length);
  const prev = () => setIndex((i) => (i - 1 + MISSION_DEMOS.length) % MISSION_DEMOS.length);

  const current = MISSION_DEMOS[index];

  return (
    <div className="relative w-full max-w-7xl mx-auto py-24 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual Narrative */}
        <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl bg-white dark:bg-[#161b22]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Image
                src={current.image}
                alt={current.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Floating Controls */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <button
              onClick={prev}
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex gap-2">
              {MISSION_DEMOS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 transition-all duration-300 rounded-full ${i === index ? 'w-8 bg-blue-600' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content Logic */}
        <div className="space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-3xl ${current.bg} ${current.color}`}>
                  <current.icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${current.color}`}>
                    {current.subtitle}
                  </h4>
                  <h2 className="text-5xl font-black tracking-tighter dark:text-white leading-none mt-1 font-tactical italic uppercase">
                    {current.title.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="font-serif-emphasis normal-case text-blue-600 dark:text-blue-400">
                      {current.title.split(' ').slice(-1)}
                    </span>
                  </h2>
                </div>
              </div>

              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {current.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
                      {stat}
                    </span>
                  </div>
                ))}
              </div>

              <button className="h-20 px-12 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                Launch Similar Mission <Zap className="w-6 h-6" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
