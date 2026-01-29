'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Workflow,
  GitBranch,
  Layers,
  Repeat,
  ShieldCheck,
  Zap,
  ArrowRight,
  Target,
  Activity,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden font-sans">
      <Navbar />

      <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
        <header className="mb-32 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-100 dark:border-blue-800 uppercase tracking-widest shadow-sm">
            <Workflow className="w-4 h-4" /> Systematic Orchestration
          </div>
          <h1 className="text-6xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
            Smarter <br />
            <span className="text-blue-600 dark:text-blue-500">Workflows.</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
            Don't just automate. Orchestrate. G-Pilot infuses business logic with spatial
            state-mapping and real-time mission validation via LangGraph loops.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Visual: The 8K Smart Workflow Explainer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative aspect-square rounded-[5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
          >
            <Image
              src="/smart_workflows_main.png"
              alt="G-Pilot Smart Workflows"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Features List: Tactical Cards */}
          <div className="space-y-16 pt-12">
            {[
              {
                title: 'Dynamic Branching',
                desc: 'Workflows that pivot based on live intelligence telemetry. No more rigid linear sequences or binary triggers.',
                icon: GitBranch,
              },
              {
                title: 'Persistent History',
                desc: 'Every mission step is recorded in our Prisma-backed high-performance ledger for full auditing and cost transparency.',
                icon: Repeat,
              },
              {
                title: 'Gemini Edge Reasoning',
                desc: 'Native integration with the newest Gemini-3 models allows for reasoning that exceeds standard agentic benchmarks.',
                icon: Zap,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 15 }}
                className="flex gap-10 items-start group"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center border border-blue-100 dark:border-blue-800 shrink-0 group-hover:bg-blue-600 transition-all duration-500 shadow-sm">
                  <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="pt-10">
              <button className="h-20 px-12 bg-blue-600 text-white font-black text-2xl rounded-[1.5rem] shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-transform flex items-center gap-4">
                Build Your Graph <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Infrastructure Footer Stat */}
        <div className="mt-40 p-12 rounded-[4rem] bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white">
                Orchestration Substrate
              </h4>
              <p className="text-gray-500 font-medium">
                Powering 10k+ concurrent mission branches per sector.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
