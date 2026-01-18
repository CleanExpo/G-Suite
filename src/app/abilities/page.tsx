'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import {
  Cpu,
  Search,
  FileText,
  Globe,
  Zap,
  Play,
  Image as ImageIcon,
  Video,
  BarChart,
  Shield,
  Lock,
  LucideIcon,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AbilityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  howTo: string;
  demoPrompt: string;
}

const AbilityCard = ({
  title,
  description,
  icon: Icon,
  category,
  howTo,
  demoPrompt,
}: AbilityCardProps) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="relative group p-8 rounded-[3rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />

    <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-start">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
          {category}
        </span>
      </div>

      <div>
        <h3 className="text-2xl font-black italic tracking-tighter mb-4 text-gray-900 dark:text-white uppercase group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div className="pt-6 border-t border-gray-50 dark:border-white/5 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Tactical Use:
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-500 italic">{howTo}</p>
        </div>
        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">
            Demo Command:
          </span>
          <p className="text-xs font-mono text-gray-400 dark:text-blue-400/70 overflow-hidden text-ellipsis whitespace-nowrap">
            "{demoPrompt}"
          </p>
        </div>
      </div>

      <Link href={`/dashboard?prompt=${encodeURIComponent(demoPrompt)}`}>
        <button className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-blue-600 dark:hover:bg-blue-50 hover:text-white dark:hover:text-blue-600">
          Deploy Now <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  </motion.div>
);

export default function AbilitiesPage() {
  const abilities = [
    {
      category: 'Visualization',
      title: 'Imagen 3 3D Assets',
      description:
        'Generate ultra-realistic 3D isometric brand assets and architectural renders. Designed for high-converting marketing materials.',
      icon: ImageIcon,
      howTo: 'Best for creating unique visuals that stock photography cannot provide.',
      demoPrompt:
        'Create a 3D isometric render of a floating server lab with blue neon core, cinematic lighting, 8k resolution.',
    },
    {
      category: 'Motion',
      title: 'Cinematic Video',
      description:
        "Orchestrate motion graphics and cinematic loops tailored to your brand's kinetic identity. Powered by G-Pilot's motion engine.",
      icon: Video,
      howTo: 'Ideal for background loops or feature announcement snippets on social media.',
      demoPrompt:
        'Generate a slow-motion cinematic sweep of a high-tech cockpit with glowing blue sensors and nebula background.',
    },
    {
      category: 'Intelligence',
      title: 'Market Intel Reports',
      description:
        'Deep research swarms that crawl the web, Grounding results with Gemini, to produce comprehensive strategic dossiers.',
      icon: Search,
      howTo: 'Use this to stay ahead of competitors or analyze market shifts in real-time.',
      demoPrompt:
        "Run a deep research report on the current state of autonomous agent infrastructure and G-Pilot's positioning.",
    },
    {
      category: 'Creative',
      title: 'Slide Deck Builder',
      description:
        'Automated storyboard-to-slide generation. G-Pilot builds the outline, exports to Google Slides, and fills content via LLM reasoning.',
      icon: FileText,
      howTo: 'Rapidly prototype investment decks or internal strategy presentations.',
      demoPrompt:
        "Create a 5-slide pitch deck for G-Pilot's 2026 expansion into the decentralized compute market.",
    },
    {
      category: 'Sovereignty',
      title: 'Vault Proxy',
      description:
        'Secure AES-256 handling of sensitive Google API and OAuth keys. Mission data is ephemeral, ensuring absolute privacy.',
      icon: Lock,
      howTo: 'Crucial for enterprise compliance and handling sensitive customer data safely.',
      demoPrompt:
        'Securely bridge my Google AI Studio key and scrape brand assets from g-pilot.app for a new mission.',
    },
    {
      category: 'Orchestration',
      title: 'Crawl & Vectorize',
      description:
        'Autonomous brand vector extraction. G-Pilot reads any URL to determine brand voice, colors, and logos automatically.',
      icon: Globe,
      howTo: 'Uniformity across all agent outputs, ensuring your AI sounds and looks like you.',
      demoPrompt:
        'Crawl g-pilot.app and extract the brand identity vectors for a social media campaign.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors pb-32 font-sans">
      <Navbar />

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <header className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
              <Cpu className="w-4 h-4" /> Operational Matrix
            </div>
            <h1 className="text-6xl lg:text-9xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.8]">
              The Ability <br />
              <span className="text-blue-600 dark:text-blue-400">Codex.</span>
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              A definitive tactical library of G-Pilot's capabilities. Each module is a
              battle-tested agent workflow refined for the Gemini-3 engine.
            </p>
          </header>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative aspect-square rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
          >
            <Image
              src="/abilities_codex_8k.png"
              alt="Abilities Codex"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {abilities.map((ability, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <AbilityCard {...ability} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-40 p-16 lg:p-24 rounded-[4rem] bg-gray-900 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">
                Execute on the <br />
                Edge.
              </h2>
              <p className="text-xl text-gray-400 font-medium">
                Ready to see G-Pilot in action? Load the Codex into the command center and launch
                your first mission today.
              </p>
              <button className="h-20 px-12 bg-blue-600 rounded-[1.5rem] font-black text-2xl hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-blue-600/30">
                Launch Mission
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
