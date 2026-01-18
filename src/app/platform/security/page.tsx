'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Shield,
  Lock,
  Fingerprint,
  Key,
  FileWarning,
  EyeOff,
  Target,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden">
      <Navbar />

      <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
        <header className="mb-32 space-y-8">
          <h1 className="text-6xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
            The Security <br />
            <span className="text-blue-600 dark:text-blue-500">Vault.</span>
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-3xl">
            At G-Pilot, privacy is the substrate. We've engineered an infrastructure where
            autonomous agents execute in hermetically sealed sandboxes. Data is ephemeral. Logic is
            absolute.
          </p>
        </header>

        {/* Security Features Grid: Spatial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              title: 'AES-256 Encryption',
              desc: 'All sensitive API keys and brand data are encrypted at rest using industry-standard AES-256-GCM, stored in isolated regional vaults.',
              icon: Lock,
            },
            {
              title: 'Ephemeral Runtimes',
              desc: 'Mission runtimes are spun up on-demand and purged instantly upon completion. Zero persistent traces of your intellectual property.',
              icon: EyeOff,
            },
            {
              title: 'Key Ownership',
              desc: 'Maintain full command of your Google and social API keys. G-Pilot acts as a secure proxy, never storing raw credentials in human-readable form.',
              icon: Key,
            },
            {
              title: 'SOC2 Ready',
              desc: 'Our data handling protocols are natively built to align with the strictest SOC2 Type II and ISO 27001 compliance frameworks.',
              icon: Shield,
            },
            {
              title: 'MFA Authentication',
              desc: 'Dashboard access requires multi-factor biometric authentication via Clerk, ensuring only authorized commanders launch missions.',
              icon: Fingerprint,
            },
            {
              title: 'Kinetic Monitoring',
              desc: 'Real-time AI-powered threat detection monitors for unusual agent behavior or unauthorized uplink attempts across the global hub.',
              icon: FileWarning,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3.5rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 hover:border-blue-600/30 transition-all flex flex-col group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-blue-900/20 shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tactical Shield Section */}
        <section className="mt-40 p-16 lg:p-24 rounded-[4.5rem] bg-gray-900 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                Our Data <br />
                Sovereignty.
              </h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                G-Pilot does not train on your inputs. We do not sell telemetry. We provide the
                secure high-performance cockpit; you own the objective logic.
              </p>
              <Link href="/privacy">
                <button className="h-20 px-12 bg-white text-black font-black text-xl rounded-2xl hover:scale-105 transition-transform flex items-center gap-4">
                  Sharing Policy <ArrowRight className="w-6 h-6" />
                </button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="w-80 h-80 lg:w-[450px] lg:h-[450px] border-[1px] border-white/10 rounded-full flex items-center justify-center relative"
                >
                  <div className="absolute inset-0 border-[1px] border-blue-600/30 rounded-full blur-xl animate-pulse" />
                  <Shield className="w-40 h-40 lg:w-64 lg:h-64 text-blue-600/40" />
                  <Lock className="absolute w-12 h-12 text-blue-400 transform -translate-y-12" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
