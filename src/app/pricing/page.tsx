'use client';

import { Navbar } from '@/components/navbar';
import { Check, Info, Sparkles, Zap, ArrowRight, Shield, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { TacticalBox } from '@/components/ui/tactical-box';

export default function PricingPage() {
  const plans = [
    {
      name: 'Commander',
      price: '$0',
      desc: 'For solo architects exploring agentic reasoning and manual fleet orchestration.',
      features: [
        '5 Sandbox Agents',
        'Standard Intel Scraping',
        'Google Slides Export',
        'Community Uplink',
      ],
      accent: 'blue',
    },
    {
      name: 'Admiral',
      price: '$49',
      desc: 'The enterprise standard for high-bandwidth missions and multi-modal fleet deployment.',
      features: [
        '50 Active Agents',
        'Imagen 3 3D Rendering',
        'Cinematic Video Loops',
        'Deep SEO Telemetry',
        'Priority GPU Scheduling',
      ],
      accent: 'blue',
      popular: true,
    },
    {
      name: 'Vanguard',
      price: 'Custom',
      desc: 'Military-grade infrastructure with dedicated compute clusters and biometric sovereignty.',
      features: [
        'Unlimited Agent Scaling',
        'Dedicated L4 GPU Node',
        'Custom LLM Fine-tuning',
        'On-Premise Vault Data',
        '24/7 Tactical Support',
      ],
      accent: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors pb-32 font-sans overflow-x-hidden">
      <Navbar />

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <header className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-100 dark:border-blue-800 uppercase tracking-widest shadow-sm">
              <Zap className="w-4 h-4" /> Cost Transparency Mode
            </div>
            <h1 className="text-6xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
              Tactical <br />
              <span className="text-blue-600 dark:text-blue-500">Pricing.</span>
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Transparent, mission-driven cost modeling. No hidden tokens. No enterprise bloat. You
              pay for the compute intelligence you deploy.
            </p>
          </header>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative aspect-video rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
          >
            <Image src="/pricing_nodes_8k.png" alt="Pricing Nodes" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`p-10 rounded-[3.5rem] bg-white dark:bg-[#161b22] border ${plan.popular ? 'border-blue-600 dark:border-blue-500/50 shadow-2xl shadow-blue-600/10' : 'border-gray-100 dark:border-white/5'} flex flex-col group relative`}
            >
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 text-white text-[10px] uppercase font-black tracking-[0.3em] rounded-full shadow-xl shadow-blue-600/30">
                  Primary Command
                </div>
              )}

              <div className="mb-12">
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gray-400 mb-4">
                  {plan.name}
                </h3>
                <div className="text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 flex items-baseline">
                  {plan.price}
                  <span className="text-xl text-gray-400 font-bold uppercase tracking-widest ml-1">
                    {plan.price !== 'Custom' ? '/mo' : ''}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-6 mb-16 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 text-sm text-gray-900 dark:text-white font-bold group-hover:text-blue-600 transition-colors"
                  >
                    <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full h-20 rounded-[1.5rem] font-black text-xl uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${plan.popular ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/10'}`}
              >
                Select Tier <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}
