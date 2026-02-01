'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Send, Loader2, Rocket, Target, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Mission');
  const [input, setInput] = useState('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/agents',
        body: { agentName: 'mission-overseer' },
      }),
    [],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    onFinish: () => {
      setInput('');
      onSuccess();
      setTimeout(onClose, 1500);
    },
  });

  // Reset input when initialInput changes
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  // Clear chat state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
    }
  }, [isOpen, setMessages]);

  const isLaunching = status === 'submitted' || status === 'streaming';

  // Derive log lines from the last assistant message
  const logs = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant?.parts) return [];

    const text = lastAssistant.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');

    return text.split('\n').filter(Boolean);
  }, [messages]);

  function handleLaunch() {
    if (!input || isLaunching) return;
    sendMessage({ text: input });
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
            className="relative bg-white dark:bg-[#161b22] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between p-10 border-b border-gray-50 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white">
                    {t('title').split(' ')[0]}{' '}
                    <span className="text-blue-600">
                      {t('title').split(' ').slice(1).join(' ')}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    {t('version')}
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

            <div className="p-10 space-y-8 overflow-y-auto">
              {!isLaunching ? (
                /* Input Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Target className="w-3 h-3 text-blue-600" /> {t('description')}
                    </label>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">
                      {t('encrypted')}
                    </span>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('placeholder')}
                    className="w-full h-48 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-3xl p-8 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-600/50 transition-all leading-relaxed text-lg resize-none"
                  />
                </div>
              ) : (
                /* Streaming Terminal Mode */
                <div className="bg-black/90 rounded-3xl p-8 font-mono text-xs text-green-400 h-64 overflow-hidden flex flex-col relative">
                  <div className="absolute top-0 right-0 p-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                    {logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="break-words"
                      >
                        <span className="text-green-600 mr-2">{'>'}</span>
                        {log}
                      </motion.div>
                    ))}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4" /> {error.message}
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={isLaunching}
                  className={`flex-1 h-16 rounded-2xl font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest text-xs ${isLaunching ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching || !input}
                  className="flex-[2] h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLaunching ? (
                    <span className="flex items-center gap-2">
                      {t('launching')} <span className="animate-pulse">...</span>
                    </span>
                  ) : (
                    <>
                      {t('deploy')}{' '}
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
