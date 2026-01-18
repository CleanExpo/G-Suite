'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { MissionShowcase } from '@/components/mission-showcase';
import {
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Zap,
  Globe,
  Share2,
  Target,
  BarChart3,
  Cpu,
} from 'lucide-react';
import Image from 'next/image';

export default function MarketingSolutionsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
              <Target className="w-4 h-4" /> Strategic Growth Node
            </div>
            <h1 className="text-7xl lg:text-[9rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
              Growth <br />
              <span className="text-blue-600">Engine.</span>
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-xl">
              We don't do 'marketing'. We orchestrate algorithm-aligned dominance across Google,
              Reddit, and X using autonomous LLM-native agents.
            </p>
            <div className="flex gap-6">
              <button className="h-20 px-12 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl">
                Start Campaign
              </button>
            </div>
          </div>
          <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl">
            <Image
              src="/marketing_campaign_dashboard_preview.png"
              alt="Marketing Results"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Case Studies / demonstrations */}
      <section className="py-40 bg-gray-50/50 dark:bg-[#0d1017]">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl lg:text-8xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
            Tactical <br />
            <span className="text-blue-600">Proof.</span>
          </h2>
          <p className="text-gray-500 font-medium text-xl mt-6">
            Live mission data demonstrating $12k+ value delivery per cycle.
          </p>
        </div>
        <MissionShowcase />
      </section>

      {/* The Swarm Logic */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                title: 'LLM Search Optimization',
                desc: 'Algorithms have evolved. We optimize your brand for Perplexity, Gemini, and GPT search behaviors, not just keyword density.',
                icon: Cpu,
                color: 'text-blue-600',
              },
              {
                title: 'Reddit Reddit Velocity',
                desc: 'Penetrate the most influential subreddits with authentic, agentic discussions that drive organic brand sentiment and high-intent traffic.',
                icon: MessageSquare,
                color: 'text-orange-500',
              },
              {
                title: 'Revenue Attribution',
                desc: 'Connect every social interaction directly to your commerce funnels with automated conversion tracking and live ROI telemetry.',
                icon: BarChart3,
                color: 'text-emerald-500',
              },
            ].map((node, i) => (
              <div
                key={i}
                className="p-12 rounded-[3.5rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-sm space-y-8 group"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/5 ${node.color}`}
                >
                  <node.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
                  {node.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {node.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-blue-600 text-white rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12">
          <h2 className="text-6xl lg:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.75]">
            Master the <br />
            <span className="text-black/20">Algorithms.</span>
          </h2>
          <button className="h-24 px-20 bg-white text-blue-600 rounded-[2.5rem] font-black text-3xl shadow-2xl hover:scale-105 transition-all">
            Ignite My Fleet
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">
            Sovereign Encryption Active · G-Pilot Mesh v9.42
          </div>
        </div>
      </section>
    </div>
  );
}
