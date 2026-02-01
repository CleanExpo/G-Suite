'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Server,
  Zap,
  Cpu,
  Cloud,
  Database,
  Network,
  Lock,
  LucideIcon,
  Activity,
} from 'lucide-react';

const StatCard = ({ label, val, icon: Icon }: { label: string; val: string; icon: LucideIcon }) => (
  <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/10 transition-all">
    <div className="mb-6 w-12 h-12 bg-white dark:bg-black/20 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</h4>
    <div className="text-2xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">
      {val}
    </div>
  </div>
);

export default function InfrastructurePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden">
      <Navbar />

      <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
        <header className="mb-24 space-y-8">
          <h1 className="text-6xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
            Global Scale. <br />
            <span className="text-blue-600 dark:text-blue-500">Zero Latency.</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-3xl">
            Built exclusively on Google's high-performance silicon. G-Pilot orchestrates missions
            across a distributed matrix of GPUs, ensuring sub-second response times for complex
            agentic reasoning.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Architecture Pillar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 p-16 rounded-[4.5rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-2xl space-y-12"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Cloud className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white leading-tight">
                  Google Cloud Native
                </h2>
                <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mt-1">
                  Architecture Substrate
                </p>
              </div>
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
              "G-Pilot is not merely hosted; it is architecturally fused with Google Cloud Run. Our
              core fleet utilizes native GPU acceleration to power multi-modal generation at the
              speed of thought."
            </p>
          </motion.div>

          {/* Secondary Modules */}
          <div className="space-y-12">
            <div className="p-12 rounded-[4rem] bg-gradient-to-br from-gray-900 to-black text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent" />
              <Cpu className="w-14 h-14 mb-8 text-blue-500" />
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                Precision Compute
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                Utilizing NVIDIA L4 Tensor Core GPU clusters for the Imagen 3 and Cinematic Video
                pipelines. Built for speed, scaled for intelligence.
              </p>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="h-full w-1/3 bg-blue-500"
                />
              </div>
            </div>

            <div className="p-12 rounded-[4rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-xl">
              <Database className="w-14 h-14 text-purple-600 mb-8" />
              <h3 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white mb-2 underline decoration-purple-600/30 underline-offset-8">
                AlloyDB.
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed mt-4">
                Strategic ledger synchronization using Google's enterprise database matrix.
              </p>
            </div>
          </div>
        </div>

        {/* Network Map Section */}
        <section className="mt-40 p-16 lg:p-24 rounded-[5rem] bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase dark:text-white leading-tight">
              22 Global Regions. <br />
              One Command Hub.
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              Your missions execute on the hardware nearest to your users, minimizing latent drag
              across the global fleet.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
