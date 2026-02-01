'use client';

import { useState } from 'react';
import {
  Zap,
  Target,
  Globe,
  Rocket,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  BarChart3,
  FileText,
  Camera,
  Video,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'objective' | 'targeting' | 'execution' | 'review';

export default function CampaignBuilderPage() {
  const [activeStep, setActiveStep] = useState<Step>('objective');
  const [mission, setMission] = useState('');
  const [audience, setAudience] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [missionResult, setMissionResult] = useState<any>(null);

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    setActiveStep('execution');

    try {
      const response = await fetch('/api/campaign/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission,
          audience,
          platform: platforms.join(', '),
          goals: 'High performance growth, brand awareness',
        }),
      });

      const data = await response.json();
      setMissionResult(data);
    } catch (error) {
      console.error('Launch failed', error);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white p-4 lg:p-12 font-sans selection:bg-blue-500/30">
      {/* Tactical Grid Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(#ffffff11 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#07090d] via-transparent to-[#07090d]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                G-Pilot Operative
              </span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter">
              MISSION{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 underline decoration-blue-500/20 underline-offset-8">
                ARCHITECT
              </span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-6 border border-white/5 bg-white/[0.02] backdrop-blur-xl px-6 py-3 rounded-2xl">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Sovereign Tier
              </span>
              <span className="text-sm font-black text-emerald-400">UNLIMITED OPS</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-16 flex items-center justify-center gap-4">
          {(['objective', 'targeting', 'review'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all border
                                ${activeStep === s ? 'bg-blue-600 border-blue-500 text-white scale-125 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500'}
                            `}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-12 h-[2px] bg-white/5" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Primary UI */}
          <main className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeStep === 'objective' && (
                <motion.div
                  key="objective"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-500" /> Defining Mission Objective
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          What is the payload?
                        </label>
                        <textarea
                          value={mission}
                          onChange={(e) => setMission(e.target.value)}
                          placeholder="e.g. Launching a new premium AI coffee machine for tech founders..."
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all min-h-[160px] resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer group">
                          <Sparkles className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                          <div className="font-bold text-sm">Aggressive Growth</div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group">
                          <Globe className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                          <div className="font-bold text-sm">Brand Authority</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveStep('targeting')}
                    disabled={!mission}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-xl disabled:opacity-50"
                  >
                    NEXT PHASE <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {activeStep === 'targeting' && (
                <motion.div
                  key="targeting"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-3xl">
                    <h3 className="text-xl font-bold mb-8">Intelligence & Trajectory</h3>
                    <div className="space-y-8">
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">
                          Deployment Platforms
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            'LinkedIn',
                            'Instagram',
                            'Twitter',
                            'Google Ads',
                            'Reddit',
                            'Email',
                          ].map((p) => (
                            <button
                              key={p}
                              onClick={() => togglePlatform(p)}
                              className={`
                                                                py-4 rounded-xl text-xs font-bold border transition-all
                                                                ${platforms.includes(p) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}
                                                            `}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 block">
                          Target Demographic
                        </label>
                        <input
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="e.g. Tech Founders, 25-45, HNWIs"
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveStep('objective')}
                      className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                      BACK
                    </button>
                    <button
                      onClick={handleLaunch}
                      disabled={!audience || platforms.length === 0}
                      className="flex-[2] bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                    >
                      INITIATE LAUNCH <Rocket className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 'execution' && (
                <motion.div
                  key="execution"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.03] border border-white/5 rounded-[40px] p-12 backdrop-blur-3xl text-center min-h-[500px] flex flex-col items-center justify-center"
                >
                  <div className="relative mb-12">
                    <div className="absolute inset-0 bg-blue-500/30 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin flex items-center justify-center">
                      <div className="w-24 h-24 border-4 border-emerald-500 border-b-transparent rounded-full animate-spin-reverse flex items-center justify-center">
                        <Zap className="w-10 h-10 text-white fill-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter mb-4">
                    SEQUENCING MISSION
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-12">
                    The G-Pilot Overseer is synchronizing with the Marketing Strategist. Market
                    intelligence is being extracted via Jina AI...
                  </p>

                  <div className="w-full max-w-lg space-y-4 text-left">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold">Researching Industry Trends</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-500">COMPLETE</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-sm font-bold">Generating Cinematic Copy</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-500 underline animate-pulse">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 opacity-30 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5" />
                        <span className="text-sm font-bold">Veo 3.1 Ad Generation</span>
                      </div>
                      <span className="text-[10px] font-mono">QUEUED</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Right Panel: Mission Intelligence */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#14151a] border border-white/5 rounded-3xl p-6">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Live Fleet Status
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold">Strategist Agent</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500">READY</span>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-xs font-bold">Vision Agent</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-500">IDLE</span>
                </div>
              </div>
            </div>

            <div className="bg-[#14151a] border border-white/5 rounded-3xl p-6">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Mission Estimates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.02] rounded-2xl">
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Time to Launch</div>
                  <div className="text-xl font-black">4.2m</div>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-2xl">
                  <div className="text-[10px] font-bold text-gray-500 mb-1">Compute Cost</div>
                  <div className="text-xl font-black">
                    124 <span className="text-xs text-blue-500">PTS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent border border-blue-500/20 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-sm font-black mb-2 flex items-center gap-2 uppercase tracking-widest">
                  <Shield className="w-4 h-4 text-blue-400" /> Secure Protocol
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-4">
                  All campaign assets are generated in a Sovereign execution environment. Keys never
                  leave the Vault.
                </p>
                <button className="text-[10px] font-black underline uppercase tracking-widest text-blue-400">
                  View Policy
                </button>
              </div>
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-600/10 blur-2xl rounded-full group-hover:scale-150 transition-transform" />
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
