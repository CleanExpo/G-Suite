'use client';

import { useState } from 'react';
import { Rocket, Zap, Shield, Loader2, Check, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCheckoutSession } from '@/actions/stripe.actions';

export default function CreditDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const packages = [
    {
      id: 'STARTER',
      name: 'Founder',
      price: '$22',
      credits: '500',
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      color: 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#1c222b]',
      btnColor:
        'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20',
      features: ['Essential Orchestration', 'Standard Node Support'],
    },
    {
      id: 'PRO',
      name: 'Director',
      price: '$33',
      credits: '1,500',
      icon: <Rocket className="w-6 h-6 text-white" />,
      color: 'border-blue-600/30 bg-blue-600 text-white',
      btnColor: 'bg-white text-blue-600 hover:bg-blue-50',
      popular: true,
      features: ['Deep Research Access', 'Priority Command', 'Vault Encryption'],
    },
    {
      id: 'GROWTH',
      name: 'Vanguard',
      price: '$49.95',
      credits: '5,000',
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      color: 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#1c222b]',
      btnColor:
        'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20',
      features: ['Custom SPEC Nodes', 'Global Hub Support', '24/7 Intel Access'],
    },
  ];

  async function handlePurchase(pkgId: any) {
    setLoading(pkgId);
    try {
      const result = await createCheckoutSession(pkgId);
      if (result.url) window.location.href = result.url;
    } catch (error) {
      console.error('Stripe error:', error);
      alert('Checkout uplink failed. Please retry.');
    } finally {
      setLoading(null);
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
            className="absolute inset-0 bg-white/70 dark:bg-[#0b0e14]/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-[#f8f9fa] dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-2xl rounded-[4rem] overflow-hidden"
          >
            <div className="p-10 md:p-16">
              <div className="flex justify-between items-start mb-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Ledger Replenishment
                    </span>
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
                    Fuel Your <span className="text-blue-600">Enterprise.</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                    Select a mission-driven fuel package for your autonomous fleet.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl hover:scale-110 transition-transform"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative p-10 rounded-[3rem] border transition-all hover:y-[-8px] duration-500 flex flex-col ${pkg.color} ${pkg.popular ? 'shadow-2xl shadow-blue-600/30' : 'shadow-sm'}`}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white dark:text-black text-white text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-xl">
                        Propulsion Choice
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-8">
                      <div
                        className={`p-3 rounded-2xl border ${pkg.popular ? 'bg-white/20 border-white/20' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'}`}
                      >
                        {pkg.icon}
                      </div>
                      <h3 className="font-black italic uppercase tracking-tighter text-xl">
                        {pkg.name}
                      </h3>
                    </div>

                    <div className="mb-10">
                      <div className="text-5xl font-black tracking-tighter">{pkg.price}</div>
                      <div
                        className={`text-[10px] font-black uppercase tracking-widest mt-2 ${pkg.popular ? 'text-white/60' : 'text-gray-400'}`}
                      >
                        {pkg.credits} Mission Pts
                      </div>
                    </div>

                    <ul className="space-y-4 mb-12 flex-grow">
                      {pkg.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm font-bold uppercase tracking-tight"
                        >
                          <Check
                            className={`w-5 h-5 shrink-0 ${pkg.popular ? 'text-blue-200' : 'text-blue-600'}`}
                          />
                          <span
                            className={
                              pkg.popular
                                ? 'text-white/90'
                                : 'text-gray-600 dark:text-gray-400 text-xs'
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={!!loading}
                      onClick={() => handlePurchase(pkg.id)}
                      className={`w-full h-16 rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl ${pkg.btnColor}`}
                    >
                      {loading === pkg.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Replenish Ledger <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex items-center justify-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" /> Stripe Secure
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" /> Identity Verified
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
import { ArrowRight } from 'lucide-react';
