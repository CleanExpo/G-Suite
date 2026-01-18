'use client';

import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function SystemBanner() {
  return (
    <div className="bg-[#0b57d0] dark:bg-blue-900/40 text-white py-3 px-6 relative overflow-hidden group">
      <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-6 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
          <Sparkles className="w-3 h-3 text-yellow-300 fill-current" /> Insight™
        </div>
        <p className="text-sm font-bold tracking-tight hidden sm:block">
          Meet <span className="font-serif-emphasis italic text-blue-200">Orbital Strategy</span> —
          the first agentic 1:1 mission audit tool for world-class founders.
        </p>
        <Link
          href="/intel"
          className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:underline group/link"
        >
          Learn More{' '}
          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Animated Aura */}
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] pointer-events-none"
      />
    </div>
  );
}
