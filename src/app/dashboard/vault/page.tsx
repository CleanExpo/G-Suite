'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';

export default function VaultPage() {
  const [rotationStatus, setRotationStatus] = useState<'idle' | 'rotating' | 'success'>('idle');

  const handleRotateKeys = () => {
    setRotationStatus('rotating');
    // Simulate API call
    setTimeout(() => {
      setRotationStatus('success');
      setTimeout(() => setRotationStatus('idle'), 3000);
    }, 2000);
  };

  const keys = [
    { name: 'Google Gemini Pro', status: 'ACTIVE', lastRotated: '2 days ago' },
    { name: 'Firebase Admin SDK', status: 'ACTIVE', lastRotated: '5 days ago' },
    { name: 'Stripe Payments', status: 'ACTIVE', lastRotated: '1 week ago' },
    { name: 'Supabase Auth', status: 'ACTIVE', lastRotated: '1 week ago' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
              The Vault
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Military-Grade Encryption (AES-256) • Zero-Knowledge Architecture
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="bg-white dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Security Status</h3>
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                System Secure
              </span>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Master Key</p>
                  <p className="text-xs text-gray-500">Hardware Security Module (HSM)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Encryption Layer</p>
                  <p className="text-xs text-gray-500">AES-256-GCM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-600/20 text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <RefreshCw className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-4">
              <h3 className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em]">Emergency Protocol</h3>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Rotate All Secrets</h2>
              <p className="text-blue-100/80 text-sm max-w-xs">
                Initiate global key rotation. This will regenerate all API keys and re-encrypt sensitive datastores.
              </p>
            </div>

            <button
              onClick={handleRotateKeys}
              disabled={rotationStatus !== 'idle'}
              className="relative z-10 mt-8 w-full py-4 bg-white text-blue-600 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {rotationStatus === 'idle' && (
                <>
                  <RefreshCw className="w-4 h-4" /> Rotate Keys
                </>
              )}
              {rotationStatus === 'rotating' && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Rotating...
                </>
              )}
              {rotationStatus === 'success' && (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Rotated
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
            <h3 className="text-gray-900 dark:text-white font-black italic uppercase tracking-tighter text-xl">Active Credentials</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {keys.map((key) => (
              <div key={key.name} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="font-bold text-gray-900 dark:text-white">{key.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-xs font-mono text-gray-400 uppercase">{key.lastRotated}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    {key.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
