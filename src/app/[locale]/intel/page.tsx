'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Clock,
  Tag,
  ChevronRight,
  Share2,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function IntelPage() {
  const articles = [
    {
      title: 'The GPU Advantage: Why G-Pilot Native Clusters Win',
      desc: 'An in-depth analysis of Cloud Run GPU orchestration and why low-latency infrastructure is the only path for high-fidelity agentic fleets.',
      tag: 'Architecture',
      date: 'Jan 18, 2026',
      image: '/gpu_clusters_8k.png',
      readTime: '8 min',
    },
    {
      title: 'Vault Sovereignty: Managing Client-Owned Infrastructure',
      desc: "Exploring G-Pilot's unique ability to execute missions directly within user-owned Google Cloud projects via secure AES-256 handshakes.",
      tag: 'Security',
      date: 'Jan 15, 2026',
      image: '/sovereign_vault_8k.png',
      readTime: '12 min',
    },
    {
      title: 'Gemini-3 Reasoning in Multi-Agent Swarms',
      desc: 'How long-context windows and multi-modal recursive thinking are changing the fundamental landscape of autonomous recursive loops.',
      tag: 'AI Strategy',
      date: 'Jan 10, 2026',
      image: '/agent_fleet_minimalist_8k.png',
      readTime: '15 min',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors pb-32 font-sans overflow-x-hidden">
      <Navbar />

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        <header className="mb-32 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 shadow-sm">
            <BookOpen className="w-4 h-4" /> Global Intelligence Sync
          </div>
          <h1 className="text-6xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
            The Intel <br />
            <span className="text-blue-600 dark:text-blue-500">Archive.</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-3xl">
            A tactical dossier on autonomous agent strategy, infrastructure sovereignty, and the
            future of Gemini-powered orchestration. Grounded in live market telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-12">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tactical reports..."
                className="w-full h-16 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-6 text-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <button className="h-16 px-8 bg-gray-100 dark:bg-white/5 rounded-2xl font-bold flex items-center gap-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
              <Filter className="w-5 h-5" /> Filter Matrix
            </button>
          </div>
        </header>

        {/* Featured Report */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-32 group cursor-pointer"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center rounded-[5rem] bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 p-12 lg:p-20 overflow-hidden relative shadow-sm hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />

            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                <Sparkles className="w-3 h-3" /> Core Analysis
              </div>
              <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Scaling To <br />
                One Million Agents.
              </h2>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                Exploring the theoretical limit of Agentic Swarms on Google Cloud Run and why
                distributed reasoning requires a new class of secure ledger synchronization.
              </p>
              <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest text-gray-400">
                <span>Jan 20, 2026</span>
                <span>12 Min Read</span>
                <span className="text-blue-600">Infrastructure</span>
              </div>
            </div>

            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="/scaling_intelligence_8k.png"
                alt="Scaling Agents"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </div>
          </div>
        </motion.section>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {articles.map((article, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer space-y-8"
            >
              <div className="relative aspect-[4/3] rounded-[3.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm group-hover:shadow-xl transition-all">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-8 left-8 px-5 py-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white border border-white/20">
                  {article.tag}
                </div>
              </div>

              <div className="space-y-4 px-4">
                <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {article.date}
                  </span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-none">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {article.desc}
                </p>
                <div className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white">
                    Read Report{' '}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                  <button className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter Sub-Module */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-40 p-16 lg:p-24 rounded-[5rem] bg-gray-900 text-white relative overflow-hidden"
        >
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/10">
              <Target className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase leading-tight">
              Join the <br />
              G-Pilot Protocol.
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Weekly tactical syncs on the state of autonomous agency delivered directly to your
              secure Uplink.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full pt-4">
              <input
                type="email"
                placeholder="commander@agency.com"
                className="w-full h-20 px-10 rounded-[1.5rem] bg-white/5 border border-white/10 focus:outline-none focus:border-blue-600 transition-colors text-white font-medium text-lg"
              />
              <button className="h-20 px-12 bg-blue-600 text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-blue-600/30 whitespace-nowrap hover:scale-105 active:scale-95 transition-transform">
                Subscribe
              </button>
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Encrypted Transmission · Zero-Spam Sovereign
            </span>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
