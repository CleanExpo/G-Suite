'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Loader2, Zap, Rocket, Shield, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runMission } from '@/actions/mission.action';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialInput?: string;
}

export default function MissionModal({
  isOpen,
  onClose,
  onSuccess,
  initialInput,
}: MissionModalProps) {
  const [input, setInput] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  async function handleLaunch() {
    if (!input) return;
    setIsLaunching(true);
    setError(null);

    try {
      const result = await runMission(input);
      if (!result.success) throw new Error(result.error || 'Uplink Failure');

      const firstResult = result.data?.[0];
      const resultUrl = firstResult?.url || firstResult?.link;
      if (resultUrl) window.open(resultUrl, '_blank');

      setInput('');
      onSuccess();
      setTimeout(onClose, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLaunching(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/70 dark:bg-[#0b0e14]/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-[#161b22] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden"
          >
            <div className="relative flex items-center justify-between p-10 border-b border-gray-50 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white">
                    Initialize <span className="text-blue-600">Mission</span>
                  </h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    Orchestrator v4.2 · Secure Linkage
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target className="w-3 h-3 text-blue-600" /> Objective Description
                  </label>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">
                    Input Encrypted
                  </span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., 'Scan the market for G-Pilot mentions and draft a response blueprint...'"
                  className="w-full h-48 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-3xl p-8 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all leading-relaxed text-lg"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={isLaunching}
                  className="flex-1 h-16 rounded-2xl font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching || !input}
                  className="flex-[2] h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-4 group"
                >
                  {isLaunching ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Deploy Mission{' '}
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
import { AlertCircle } from 'lucide-react';
