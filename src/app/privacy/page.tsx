'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Shield,
  Lock,
  FileText,
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  Scale,
  Target,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden font-sans">
      <Navbar />

      <main className="pt-32 px-6 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <header className="space-y-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Hub
            </Link>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-6xl lg:text-7xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                  Privacy <br />
                  <span className="text-blue-600 dark:text-blue-500">& Trust.</span>
                </h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-4">
                  Security Protocol v4.0 · Jan 2026
                </p>
              </div>
            </div>
          </header>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative aspect-square rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
          >
            <Image
              src="/sovereign_vault_8k.png"
              alt="Sovereign Vault"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        <div className="space-y-16">
          {/* Main Sovereignty Card */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-12 md:p-16 rounded-[4rem] bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 space-y-10 group hover:shadow-2xl transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white dark:bg-[#161b22] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
                Domain <br />
                Sovereignty.
              </h2>
            </div>
            <p className="text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
              "G-Pilot is founded on the principle of mission sovereignty. Your domain, your logic
              swarms, and your API telemetry belong exclusively to you."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              {[
                'No training on mission data.',
                'Zero persistence for assets.',
                'AES-256 encrypted vaulting.',
                'Ephemeral GPU runtimes.',
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600" /> {item}
                </div>
              ))}
            </div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Collection Module */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-12 rounded-[3.5rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-sm space-y-8 group"
            >
              <div className="flex items-center gap-4 text-blue-600">
                <Activity className="w-8 h-8" />
                <h3 className="font-black italic uppercase tracking-tighter text-2xl">Telemetry</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
                We gather only the critical metadata required for precise ledger billing and mission
                auditing. This includes email, billing tokens, and mission UUIDs.
              </p>
            </motion.section>

            {/* Proxy Mode Module */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-12 rounded-[3.5rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-sm space-y-8 group"
            >
              <div className="flex items-center gap-4 text-purple-600">
                <EyeOff className="w-8 h-8" />
                <h3 className="font-black italic uppercase tracking-tighter text-2xl">
                  Proxy Shield
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">
                All agentic traffic is proxied through our secure Cloud Run nodes. This ensures your
                local client IP is never exposed to external API endpoints.
              </p>
            </motion.section>
          </div>

          {/* Legal Desk Matrix */}
          <section className="pt-32 border-t border-gray-100 dark:border-white/5 text-center space-y-12">
            <div className="flex justify-center flex-wrap gap-4">
              {[Scale, Target, CheckCircle2].map((Icon, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 opacity-30"
                >
                  <Icon className="w-8 h-8" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
                Compliance Archive.
              </h2>
              <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto">
                For SOC2 Type II reports, audit logs, or data erasure requests, contact our legal
                desk.
              </p>
            </div>
            <a
              href="mailto:privacy@g-pilot.app"
              className="inline-flex items-center gap-4 text-3xl font-black text-blue-600 hover:text-blue-700 transition-all underline decoration-blue-600/20 underline-offset-[12px] group"
            >
              privacy@g-pilot.app
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
