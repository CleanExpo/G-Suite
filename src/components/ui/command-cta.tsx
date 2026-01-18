'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CommandCTAProps {
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
  id?: string;
}

export function CommandCTA({ title, subtitle, buttonText, href, id }: CommandCTAProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="p-16 lg:p-24 rounded-[5rem] bg-gray-900 dark:bg-black text-white relative overflow-hidden group border border-white/5"
    >
      {/* Background Dynamics */}
      <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full group-hover:bg-blue-600/20 transition-colors duration-1000" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto">

        <h2 className="text-5xl lg:text-9xl font-black italic tracking-tighter uppercase leading-[0.8]">
          {title}
        </h2>

        <p className="text-xl lg:text-3xl text-gray-400 font-medium leading-relaxed max-w-2xl">
          {subtitle}
        </p>

        <div className="pt-8 w-full flex justify-center">
          <Link href={href}>
            <button className="h-24 px-16 bg-blue-600 text-white font-black text-3xl rounded-[2rem] shadow-2xl shadow-blue-600/30 whitespace-nowrap hover:scale-105 active:scale-95 transition-all flex items-center gap-6 group/btn">
              {buttonText}
              <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </Link>
        </div>

      </div>
    </motion.section>
  );
}
