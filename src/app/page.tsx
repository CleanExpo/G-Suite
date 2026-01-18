'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { SignInButton } from '@clerk/nextjs';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Cpu,
  Database,
  Layout,
  Sparkles,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { MissionShowcase } from '@/components/mission-showcase';
import { TacticalBox } from '@/components/ui/tactical-box';
import { TacticalTabs } from '@/components/ui/tactical-tabs';
import { CommandCTA } from '@/components/ui/command-cta';
import { TacticalTicker } from '@/components/ui/tactical-ticker';
import { MissionSimulator } from '@/components/ui/mission-simulator';
import { useRef } from 'react';

export default function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 font-sans overflow-x-hidden">
      <Navbar />

      {/* 1. Hero Section: Spatial Immersion */}
      <section
        ref={targetRef}
        className="relative h-screen min-h-[900px] flex items-center justify-center pt-32 px-6 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[60%] h-full bg-gradient-to-r from-purple-600/5 to-transparent pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Tactical Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-800 shadow-sm">
              <Sparkles className="w-4 h-4" /> Gemini-3 Algorithm Dominance
            </div>

            <h1 className="text-7xl lg:text-[10rem] font-black tracking-tighter text-gray-900 dark:text-white leading-[0.75] uppercase group font-tactical italic">
              G-PILOT <br />
              <span className="text-blue-600 group-hover:text-blue-500 transition-colors font-serif-emphasis normal-case">
                Core.
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-lg">
              Deploy high-fidelity{' '}
              <TacticalTicker
                words={['autonomous', 'recursive', 'scalable']}
                className="text-blue-600 font-bold"
              />{' '}
              agent fleets. Built on Google's most advanced reasoning engines, anchored in the{' '}
              <span className="text-gray-900 dark:text-white font-black italic underline decoration-blue-600/30 underline-offset-4">
                Cloud Run GPU matrix
              </span>
              .
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <SignInButton mode="modal">
                <button className="h-20 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-2xl shadow-2xl shadow-blue-600/30 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Ignite{' '}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
              <Link href="/abilities">
                <button className="h-20 px-10 rounded-[1.5rem] font-black text-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-3">
                  Explore Codex <Cpu className="w-5 h-5" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-gray-100 dark:border-white/5 opacity-50">
              {[
                { label: 'Latency', val: '< 400ms' },
                { label: 'Sovereignty', val: '100% Secure' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {s.label}
                  </div>
                  <div className="text-xl font-bold dark:text-white">{s.val}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: The Spatial Construction */}
          <div className="relative h-[700px] flex items-center justify-center perspective-[2000px]">
            <motion.div
              style={{ y, opacity, scale }}
              className="relative w-full h-full transform-style-3d"
            >
              {/* Layer 1: The Base (Mirror) */}
              <motion.div
                animate={{ rotateX: [15, 12, 15], rotateY: [-15, -12, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-white dark:bg-[#161b22] rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-2xl shadow-blue-500/10 dark:shadow-black/50 p-10 transform translate-z-0"
              >
                <div className="flex items-center gap-4 mb-10 border-b dark:border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <div className="w-5 h-5 bg-white rounded-full" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-gray-100 dark:bg-white/10 rounded-full mb-2" />
                    <div className="h-1.5 w-20 bg-gray-50 dark:bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-20 w-full bg-gray-50 dark:bg-white/5 rounded-[2rem] p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full" />
                      <div className="h-1 w-2/3 bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="h-20 w-full bg-gray-50 dark:bg-white/5 rounded-[2rem]" />
                </div>
              </motion.div>

              {/* Layer 2: The Core (Vanguard 8K) */}
              <motion.div
                animate={{ y: [-30, 0, -30], rotateZ: [-2, 2, -2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full shadow-[0_50px_100px_rgba(37,99,235,0.3)] overflow-hidden border-2 border-white/20 z-20"
              >
                <Image
                  src="/vanguard_core_8k.png"
                  alt="Vanguard Core"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Layer 3: Security Nodes (Vault 8K) */}
              <motion.div
                animate={{ y: [40, -40, 40] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-[10%] right-[10%] w-[200px] h-[200px] border-2 border-white/20 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden z-30 transform translate-z-[120px]"
              >
                <Image
                  src="/sovereign_vault_8k.png"
                  alt="Sovereign Vault"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
              </motion.div>
            </motion.div>

            {/* Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-20 dark:opacity-40 pointer-events-none">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-[160px] animate-pulse" />
              <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trusted By Sector (LogoCloud) */}
      <section className="py-24 px-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400">
              Trusted Partners
            </h3>
            <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
              Powered By <br />
              <span className="text-blue-600 font-serif-emphasis normal-case">
                Vanguard Industry Nodes.
              </span>
            </h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              Our architecture is anchored in the world's most robust intelligence ecosystems,
              ensuring near-zero latency and infinite scalability.
            </p>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
            <Image
              src="/vanguard_partners_cloud_8k.png"
              alt="Vanguard Partners"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. Operational Modes: Tactical Tabs */}
      <section className="py-40 px-6 bg-gray-50/30 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
              Operational <br />
              <span className="text-blue-600">Matrices.</span>
            </h2>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              Switch between mission protocols with zero friction. One UI, infinite autonomous
              depth.
            </p>
          </div>

          <TacticalTabs
            tabs={[
              {
                id: 'growth',
                label: 'Growth Mode',
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <TacticalBox
                      title="Social Swarm"
                      description="Liquid distribution of brand payloads across Reddit and X. Our agents bypass traditional ad-blindness through high-context algorithmic engagement."
                      icon={Share2}
                      id="feature-social-swarm"
                      badge="Dominance"
                      accent="Gemini 3.5 Engine"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          <span>Live Velocity</span>
                          <span>+420%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '84%' }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </TacticalBox>
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5">
                      <Image
                        src="/social_media_swarm_reddit.png"
                        alt="Social Swarm"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: 'ops',
                label: 'Operations',
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                      <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg inline-block">
                        Core Orchestration
                      </div>
                      <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
                        Simulate Your <br />
                        <span className="text-blue-600 font-serif-emphasis normal-case">
                          Intelligence Flow.
                        </span>
                      </h2>
                      <p className="text-lg text-gray-500 font-medium leading-relaxed">
                        Test your mission parameters against our reasoning engine before deployment.
                        G-Pilot ensures every vector is optimized for maximum result velocity.
                      </p>
                    </div>
                    <MissionSimulator />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* 4. Live Missions: Demonstration Slide Show */}
      <section className="py-40 px-6 bg-white dark:bg-[#0b0e14]">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
            Tactical <br />
            <span className="text-blue-600">Demonstrations.</span>
          </h2>
          <p className="text-gray-500 font-medium mt-6 text-xl">
            Inside the G-Pilot mission ledger. High-value blueprints for market dominance.
          </p>
        </div>
        <MissionShowcase />
      </section>

      <section className="py-40 px-6 bg-gray-50/50 dark:bg-[#0d1017]">
        <div className="max-w-7xl mx-auto space-y-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <TacticalBox
              title="Sovereign Crypto Vault"
              description="Military-grade encryption for all client secrets. Mission logic remains ephemeral, ensuring zero persistence of sensitive data."
              icon={ShieldCheck}
              id="feature-vault"
            />
            <TacticalBox
              title="Google Native High-RPM"
              description="Built exclusively on Cloud Run GPU clusters for near-zero latency agentic execution and limitless multi-model scaling."
              icon={Zap}
              id="feature-gcp"
            />
            <TacticalBox
              title="Dynamic Fleet Logic"
              description="Autonomous state recovery and recursive reasoning loops via LangGraph. G-Pilot agents learn from every failure."
              icon={Globe}
              id="feature-fleet"
            />
          </div>

          <CommandCTA
            title="Ready to Commander?"
            subtitle="Join the elite tier of autonomous operators. Build your fleet, secure your vault, and dominate the digital landscape."
            buttonText="Select Fleet Tier"
            href="/pricing"
            id="hero-cta-bottom"
          />
        </div>
      </section>
    </div>
  );
}
