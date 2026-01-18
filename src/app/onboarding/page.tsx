'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import {
  ArrowRight,
  Globe,
  Lock,
  Check,
  Loader2,
  Link as LinkIcon,
  Shield,
  Laptop,
  Zap,
  Cpu,
} from 'lucide-react';
import { completeOnboarding } from '@/actions/onboarding.actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [website, setWebsite] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding({ website, apiKey });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Uplink Encryption Failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0e14] flex items-center justify-center p-6 transition-colors">
      <div className="fixed top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="relative w-10 h-10 overflow-hidden rounded-full border dark:border-white/10 shadow-sm">
          <Image src="/logo-light.png" alt="G-Pilot" fill className="object-cover dark:hidden" />
          <Image
            src="/logo-dark.png"
            alt="G-Pilot"
            fill
            className="object-cover hidden dark:block"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight leading-none uppercase italic">
            G-Pilot
          </span>
          <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">
            Secure Onboarding
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl"
      >
        {/* Progress Bar (Spatial) */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 dark:bg-white/5">
          <motion.div
            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            animate={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase dark:text-white leading-none mb-4">
                  Establish <br />
                  Frequency.
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Provide your workspace domain. G-Pilot will autonomously extract brand vectors for
                  agent alignment.
                </p>
              </div>

              <div className="relative">
                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://your-brand.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-lg font-bold focus:outline-none focus:border-blue-600 transition-colors dark:text-white"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                Scan Assets <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-8"
            >
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase dark:text-white leading-none mb-4">
                  Vault <br />
                  Verification.
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  G-Pilot requires Gemini-3 API access. Your key is AES-256 encrypted and stored in
                  the secure bridge layer.
                </p>
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="sk_google_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-5 text-lg font-mono focus:outline-none focus:border-blue-600 transition-colors dark:text-white"
                />
              </div>

              <button
                onClick={handleComplete}
                disabled={isLoading || !apiKey}
                className="w-full h-16 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Complete Handshake <Cpu className="w-6 h-6" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Micro Stats */}
      <div className="fixed bottom-12 flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> SOC2 Verified
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> AES-256 Active
        </div>
      </div>
    </div>
  );
}
