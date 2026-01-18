"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Server, Shield, Cpu, Network, Database, Cloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TacticalBox } from "@/components/ui/tactical-box";
import { CommandCTA } from "@/components/ui/command-cta";

export default function PlatformPage() {
    const pillars = [
        {
            title: "Global Infrastructure",
            desc: "Leveraging Google Cloud Run GPU and Artifact Registry for zero-latency agent execution anywhere on earth.",
            icon: Server,
            href: "/platform/infrastructure",
            tag: "High Availability"
        },
        {
            title: "Vault Security",
            desc: "Zero-trust architecture utilizing military-grade AES-256 encryption. Your credentials never touch the open web.",
            icon: Shield,
            href: "/platform/security",
            tag: "SOC2 Compliance"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors">
            <Navbar />

            <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <header className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-sm"
                        >
                            Foundation
                        </motion.div>
                        <h1 className="text-5xl lg:text-9xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.8]">
                            The G-Pilot <br />
                            <span className="text-blue-600 dark:text-blue-400">Architecture</span>
                        </h1>
                    </header>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative aspect-video rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group"
                    >
                        <Image
                            src="/global_infrastructure_8k.png"
                            alt="Global Infrastructure"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {pillars.map((pillar, i) => (
                        <Link href={pillar.href} key={i}>
                            <TacticalBox
                                title={pillar.title}
                                description={pillar.desc}
                                icon={pillar.icon}
                                id={`platform-pillar-${i}`}
                            >
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                                    Exploration Guide <span className="text-xl">→</span>
                                </div>
                            </TacticalBox>
                        </Link>
                    ))}
                </div>

                {/* Technical Stack Section */}
                <section className="mt-40 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Built Exclusively on <br />Google Cloud.</h2>
                        <p className="text-gray-600 dark:text-gray-400">We leverage the full power of the Google ecosystem to deliver unmatched reliability and speed.</p>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { name: "Gemini 3.0", icon: Cpu },
                            { name: "Cloud Run", icon: Cloud },
                            { name: "Vertex AI", icon: Database },
                            { name: "Artifacts", icon: Network }
                        ].map((tech, i) => (
                            <div key={i} className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-blue-400/50 grayscale hover:grayscale-0 transition-all">
                                    <tech.icon className="w-8 h-8" />
                                </div>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-500">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mt-40">
                    <CommandCTA
                        title="Build on Google Max."
                        subtitle="Leverage the most powerful cloud infrastructure ever built for agentic AI. Zero trust, infinite scale."
                        buttonText="Initialize Stack"
                        href="/dashboard"
                        id="platform-cta-bottom"
                    />
                </div>
            </main>
        </div>
    );
}
