'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { MissionShowcase } from '@/components/mission-showcase';
import { TacticalBox } from '@/components/ui/tactical-box';
import { TacticalTabs } from '@/components/ui/tactical-tabs';
import { CommandCTA } from '@/components/ui/command-cta';
import { EcosystemVisual } from '@/components/ui/ecosystem-visual';
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

      {/* 1. Hero Section: Ecosystem Integration */}
      <section
        ref={targetRef}
        className="relative h-screen min-h-[900px] flex items-center justify-center pt-32 px-6 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[60%] h-full bg-gradient-to-r from-green-600/5 to-transparent pointer-events-none" />

          {/* 3D Depth Fog */}
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-white/10 dark:to-black/30 pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Tactical Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-[0.3em] border border-blue-100/50 dark:border-blue-800 shadow-[0_0_20px_rgba(37,99,235,0.1)] backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              The Ultimate Bridge for AI Mastery
            </div>

            <h1 className="text-7xl lg:text-[9rem] font-black tracking-tighter text-gray-900 dark:text-white leading-[0.8] uppercase group font-tactical italic">
              Architect Your <br />
              <span className="text-blue-600 transition-colors font-serif-emphasis normal-case drop-shadow-2xl">
                Future with G-Pilot.
              </span>
            </h1>

            <p className="text-xl lg:text-3xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-xl">
              The only platform that seamlessly integrates 20+ Google AI Studio tools into one unified workflow.{' '}
              <span className="text-blue-600 font-bold underline decoration-blue-600/20 underline-offset-8">Master innovation</span> without the learning curve.
            </p>

            <div className="flex flex-wrap items-center gap-8 pt-6">
              <SignInButton mode="modal">
                <button className="h-24 px-14 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Unleash G-Pilot Now
                </button>
              </SignInButton>
              <Link href="/abilities">
                <button className="h-24 px-12 rounded-[2.5rem] font-black text-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-3 border-4 border-transparent hover:border-blue-600/10">
                  Explore Ecosystem
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right: The Ecosystem Visual (3D Brand Hub) */}
          <div className="relative h-[800px] flex items-center justify-center">
            <motion.div
              style={{ y, opacity, scale }}
              className="w-full h-full"
            >
              <EcosystemVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Trusted By Sector (3D Depth) */}
      <section className="py-32 px-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400">
              Trusted Partners
            </h3>
            <h2 className="text-6xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-none">
              Powered By <br />
              <span className="text-blue-600 font-serif-emphasis normal-case">
                Vanguard Industry Nodes.
              </span>
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
              Our architecture is anchored in the world's most robust intelligence ecosystems,
              ensuring near-zero latency and infinite scalability.
            </p>
          </div>
          <div className="relative aspect-video rounded-[4rem] overflow-hidden border-2 border-gray-100 dark:border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.1)] grayscale hover:grayscale-0 transition-all duration-1000 group">
            <Image
              src="/vanguard_partners_cloud_8k.png"
              alt="Vanguard Partners"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition-colors" />
          </div>
        </div>
      </section>

      {/* 3. Operational Modes: Tactical Tabs */}
      <section className="py-48 px-6 bg-gray-50/30 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-8">
            <h2 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
              Operational <br />
              <span className="text-blue-600">Matrices.</span>
            </h2>
            <p className="text-2xl text-gray-500 font-medium max-w-3xl mx-auto italic">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <TacticalBox
                      title="Social Swarm"
                      description="Liquid distribution of brand payloads across Reddit and X. Our agents bypass traditional ad-blindness through high-context algorithmic engagement."
                      image="/assets/google/mariner_logo_v2.png"
                      id="feature-social-swarm"
                      badge="Dominance"
                      accent="Gemini 3.5 Engine"
                    >
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">
                          <span>Live Velocity</span>
                          <span>+420%</span>
                        </div>
                        <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '84%' }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                          />
                        </div>
                      </div>
                    </TacticalBox>
                    <div className="relative aspect-video rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 transform-gpu rotate-2 hover:rotate-0 transition-transform duration-700">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                      <div className="px-5 py-2 bg-blue-100 dark:bg-blue-900/50 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-[0.3em] rounded-xl inline-block shadow-lg shadow-blue-500/10">
                        Core Orchestration
                      </div>
                      <h2 className="text-6xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.9]">
                        Simulate Your <br />
                        <span className="text-blue-600 font-serif-emphasis normal-case">
                          Intelligence Flow.
                        </span>
                      </h2>
                      <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                        Test your mission parameters against our reasoning engine before deployment.
                        G-Pilot ensures every vector is optimized for maximum result velocity.
                      </p>
                    </div>
                    <div className="perspective-[2000px]">
                      <motion.div
                        whileHover={{ rotateX: 5, rotateY: -5 }}
                        className="transform-style-3d"
                      >
                        <MissionSimulator />
                      </motion.div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* 4. Live Missions: Demonstration Showcase */}
      <section className="py-48 px-6 bg-white dark:bg-[#0b0e14]">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <h2 className="text-6xl lg:text-9xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-[0.8] mb-8">
            Tactical <br />
            <span className="text-blue-600 drop-shadow-2xl">Demonstrations.</span>
          </h2>
          <p className="text-gray-500 font-medium text-2xl italic">
            Inside the G-Pilot mission ledger. High-value blueprints for market dominance.
          </p>
        </div>
        <MissionShowcase />
      </section>

      {/* 5. Core Values (3D Branded Icons) */}
      <section className="py-48 px-6 bg-gray-50/50 dark:bg-[#0d1017]">
        <div className="max-w-7xl mx-auto space-y-48">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <TacticalBox
              title="Sovereign Crypto Vault"
              description="Military-grade encryption for all client secrets. Mission logic remains ephemeral, ensuring zero persistence of sensitive data."
              image="/assets/brand/3d_vault_v2.png"
              id="feature-vault"
            />
            <TacticalBox
              title="Google Native High-RPM"
              description="Built exclusively on Cloud Run GPU clusters for near-zero latency agentic execution and limitless multi-model scaling."
              image="/assets/brand/3d_energy_v2.png"
              id="feature-gcp"
            />
            <TacticalBox
              title="Dynamic Fleet Logic"
              description="Autonomous state recovery and recursive reasoning loops via LangGraph. G-Pilot agents learn from every failure."
              image="/assets/brand/3d_logic_v2.png"
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
