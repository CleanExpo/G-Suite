'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Users, Workflow, ArrowRight, CheckCircle, Target } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CommandCTA } from '@/components/ui/command-cta';

export default function SolutionsPage() {
  const solutions = [
    {
      title: 'Autonomous Agent Fleets',
      desc: 'Stop managing tasks. Start managing outcome-driven agents that self-correct and coordinate to complete complex missions.',
      icon: Users,
      bg: 'bg-blue-600',
      href: '/solutions/agents',
    },
    {
      title: 'Smarter Workflows',
      desc: 'Infuse every business process with LLM reasoning. From automated brand alignment to secure PDF analytics at scale.',
      icon: Workflow,
      bg: 'bg-purple-600',
      href: '/solutions/workflows',
    },
    {
      title: 'High-Value Marketing',
      desc: 'Dominate Google, Reddit, and X using algorithm-aligned agents. Generate real-world revenue with automated social swarms.',
      icon: Target,
      bg: 'bg-emerald-600',
      href: '/solutions/marketing',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors font-sans overflow-x-hidden">
      <Navbar />

      <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
        <header className="mb-32 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-8">
            The Intelligence <br />
            <span className="text-blue-600 dark:text-blue-400 italic">Workforce.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            Whether you are a solo-founder or a global enterprise, G-Pilot provides the blueprints
            to scale your efficiency with agentic AI.
          </p>
        </header>

        <div className="space-y-32">
          {solutions.map((solution, i) => (
            <div
              key={i}
              id={`solution-block-${i}`}
              className={`flex flex-col ${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 md:gap-20 items-center group`}
            >
              {/* Visual Representation */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 w-full"
              >
                <div
                  className={
                    'aspect-video rounded-[4rem] relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-white/5'
                  }
                >
                  <Image
                    src={
                      [
                        '/agent_fleets_main.png',
                        '/smart_workflows_main.png',
                        '/marketing_results_minimalist.png',
                      ][i]
                    }
                    alt={solution.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 space-y-8">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white leading-tight">
                  {solution.title}
                </h3>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  {solution.desc}
                </p>
                <ul className="space-y-4">
                  {[
                    'Scalable Architecture',
                    'Native Google Integration',
                    'Vault-grade Security',
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-gray-900 dark:text-gray-300 font-black uppercase text-[10px] tracking-widest"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href={solution.href} className="w-full sm:w-auto">
                  <button className="h-16 md:h-20 w-full sm:w-auto px-10 md:px-12 bg-gray-900 dark:bg-white dark:text-black text-white rounded-xl md:rounded-[1.5rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl active:scale-95">
                    Learn More <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-40">
          <CommandCTA
            title="Deploy Your First Agent."
            subtitle="Join thousands of commanders leveraging the G-Pilot engine for autonomous market dominance."
            buttonText="Initialize Mission"
            href="/dashboard"
            id="solutions-cta-bottom"
          />
        </div>
      </main>
    </div>
  );
}
