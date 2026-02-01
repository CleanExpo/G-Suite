'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Key, RefreshCw, Lock, CheckCircle2, AlertCircle, History } from 'lucide-react';

interface VaultCredential {
  name: string;
  active: boolean;
  currentVersion: boolean;
}

interface RotationEntry {
  version: number;
  rotatedAt: string;
  rotatedBy: string;
  keysRotated: number;
}

interface VaultData {
  keyVersion: number;
  credentials: VaultCredential[];
  rotationHistory: RotationEntry[];
  encryptionStandard: string;
}

export default function VaultPage() {
  const [rotationStatus, setRotationStatus] = useState<'idle' | 'rotating' | 'success' | 'error'>(
    'idle',
  );
  const [vault, setVault] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchVault = useCallback(async () => {
    try {
      const res = await fetch('/api/vault');
      const data = await res.json();
      if (data.success) {
        setVault(data);
      }
    } catch {
      // Vault not initialized yet — show defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const handleRotateKeys = async () => {
    setRotationStatus('rotating');
    setErrorMsg('');

    try {
      const res = await fetch('/api/vault/rotate', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setRotationStatus('success');
        // Refresh vault data
        await fetchVault();
        setTimeout(() => setRotationStatus('idle'), 3000);
      } else {
        setErrorMsg(data.error || 'Rotation failed');
        setRotationStatus('error');
        setTimeout(() => setRotationStatus('idle'), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
      setRotationStatus('error');
      setTimeout(() => setRotationStatus('idle'), 5000);
    }
  };

  const credentials = vault?.credentials ?? [];
  const rotationHistory = vault?.rotationHistory ?? [];

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
              Military-Grade Encryption ({vault?.encryptionStandard || 'AES-256-GCM'}) •
              Zero-Knowledge Architecture
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="bg-white dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
                Security Status
              </h3>
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
                  <p className="font-bold text-gray-900 dark:text-white">Key Version</p>
                  <p className="text-xs text-gray-500">v{vault?.keyVersion ?? 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Encryption Layer</p>
                  <p className="text-xs text-gray-500">
                    {vault?.encryptionStandard || 'AES-256-GCM'}
                  </p>
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
              <h3 className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em]">
                Emergency Protocol
              </h3>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                Rotate All Secrets
              </h2>
              <p className="text-blue-100/80 text-sm max-w-xs">
                Initiate global key rotation. Re-encrypts all secrets with AES-256-GCM and fresh
                initialization vectors.
              </p>
            </div>

            {errorMsg && (
              <div className="relative z-10 mt-4 flex items-center gap-2 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

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
              {rotationStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4" /> Failed
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Credentials */}
        <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
            <h3 className="text-gray-900 dark:text-white font-black italic uppercase tracking-tighter text-xl">
              Active Credentials
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              <div className="px-8 py-6 text-gray-400 text-sm">Loading vault...</div>
            ) : credentials.length === 0 ? (
              <div className="px-8 py-6 text-gray-400 text-sm">
                No credentials stored. Complete onboarding to add API keys.
              </div>
            ) : (
              credentials.map((cred) => (
                <div
                  key={cred.name}
                  className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${cred.active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`}
                    />
                    <span className="font-bold text-gray-900 dark:text-white">{cred.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {cred.currentVersion ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                        Legacy
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rotation History */}
        {rotationHistory.length > 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex items-center gap-3">
              <History className="w-5 h-5 text-gray-400" />
              <h3 className="text-gray-900 dark:text-white font-black italic uppercase tracking-tighter text-xl">
                Rotation History
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {[...rotationHistory].reverse().map((entry, i) => (
                <div
                  key={i}
                  className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                      v{entry.version}
                    </span>
                    <span className="text-xs text-gray-500">
                      {entry.keysRotated} key{entry.keysRotated !== 1 ? 's' : ''} rotated
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    {new Date(entry.rotatedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
