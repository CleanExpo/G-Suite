'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Shield,
  Lock,
  Key,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Cpu,
  Globe,
  Eye,
  EyeOff,
  ShoppingBag,
  MessageSquare,
  Twitter,
  Linkedin,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { completeOnboarding } from '@/actions/onboarding.actions';

export default function VaultPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Form State
  const [website, setWebsite] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [shopifyKey, setShopifyKey] = useState('');
  const [redditKey, setRedditKey] = useState('');
  const [xKey, setXKey] = useState('');
  const [linkedinKey, setLinkedinKey] = useState('');

  const [isEditing, setIsEditing] = useState(false);

  const toggleVisibility = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding({
        website,
        apiKey,
        shopifyAccessToken: shopifyKey,
        redditApiKey: redditKey,
        socialApiKeys: {
          x: xKey,
          linkedin: linkedinKey,
        },
      });
      setIsSuccess(true);
      setIsEditing(false);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden font-sans">
      <Navbar />

      <main className="pt-32 px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <header className="space-y-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                  Sovereign <span className="text-blue-600">Vault.</span>
                </h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2">
                  Personal Key Management & Encryption
                </p>
              </div>
            </div>
          </header>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative aspect-video rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
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

        <div className="grid grid-cols-1 gap-12">
          {/* Security Status Module */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Encryption State', val: 'AES-256 Active', icon: Lock, color: 'blue' },
              { label: 'Access Protocol', val: 'Regional Proxy', icon: Globe, color: 'emerald' },
              { label: 'Sovereignty', val: 'Client Owned', icon: Cpu, color: 'purple' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 flex items-center gap-6 shadow-sm"
              >
                <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-sm text-blue-600">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </div>
                  <div className="text-lg font-black dark:text-white leading-none">{stat.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Vault Form */}
          <motion.div
            layout
            className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 rounded-[4rem] shadow-2xl p-12 lg:p-16 relative overflow-hidden"
          >
            {/* Background Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-12">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white leading-none underline decoration-blue-600/30 underline-offset-8">
                    Secure Uplink Hub
                  </h3>
                  <p className="text-gray-500 font-medium text-lg">
                    Initialize your secure mission connections. All data is ephemeral and encrypted.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Edit Credentials
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Website Field */}
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Primary Workspace Domain
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 font-bold" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://your-brand.com"
                      className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-6 text-xl font-bold focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Google Key */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Gemini-3 API Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input
                      type={showKey['gemini'] ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={!isEditing}
                      placeholder="sk_google_..."
                      className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-16 text-xl font-mono focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => toggleVisibility('gemini')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showKey['gemini'] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Shopify Key */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Shopify Access Token
                  </label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                    <input
                      type={showKey['shopify'] ? 'text' : 'password'}
                      value={shopifyKey}
                      onChange={(e) => setShopifyKey(e.target.value)}
                      disabled={!isEditing}
                      placeholder="shpat_..."
                      className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-16 text-xl font-mono focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => toggleVisibility('shopify')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showKey['shopify'] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Reddit Key */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Reddit Scout Key
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <input
                      type={showKey['reddit'] ? 'text' : 'password'}
                      value={redditKey}
                      onChange={(e) => setRedditKey(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Client ID / Secret"
                      className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-16 text-xl font-mono focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => toggleVisibility('reddit')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showKey['reddit'] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* X/Twitter Key */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    X (Twitter) Uplink
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type={showKey['x'] ? 'text' : 'password'}
                      value={xKey}
                      onChange={(e) => setXKey(e.target.value)}
                      disabled={!isEditing}
                      placeholder="API Key Secret"
                      className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-16 text-xl font-mono focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => toggleVisibility('x')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showKey['x'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* LinkedIn Key */}
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    LinkedIn Authority Token
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
                    <input
                      type={showKey['linkedin'] ? 'text' : 'password'}
                      value={linkedinKey}
                      onChange={(e) => setLinkedinKey(e.target.value)}
                      disabled={!isEditing}
                      placeholder="OAuth 2.0 Token"
                      className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-16 pr-16 text-xl font-mono focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => toggleVisibility('linkedin')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showKey['linkedin'] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-10 md:col-span-2">
                    <button
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="h-20 flex-1 bg-blue-600 text-white rounded-[1.5rem] font-black text-2xl shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          Seal & Encrypt Hub <Shield className="w-6 h-6" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="h-20 px-10 bg-gray-100 dark:bg-white/5 rounded-[1.5rem] font-black text-xl text-gray-500 hover:text-red-500 transition-colors border border-gray-100 dark:border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Success Notification */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="flex items-center gap-6 p-10 rounded-[3rem] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] opacity-80">
                    Encryption Protocol Finalized
                  </div>
                  <div className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                    Vault Synced Successfully.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Disclaimer */}
          <div className="p-12 rounded-[4rem] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20 flex gap-10 items-start">
            <div className="w-16 h-16 bg-white dark:bg-black/20 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5 shrink-0 shadow-sm">
              <AlertCircle className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
                Global Sovereignty Protocol AD-32
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
                G-Pilot never stores your raw API keys. Every transmission is encapsulated via
                AES-256-GCM and only decrypted within ephemeral mission runtimes. We act as a secure
                infrastructure proxy only.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
