"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Users, Bot, Command, Zap, Target, Search, ArrowRight, Shield, Cpu, Activity } from "lucide-react";
import Image from "next/image";

export default function AgentsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden font-sans">
            <Navbar />

            <main className="pt-32 px-6 pb-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

                    {/* Tactical Content */}
                    <motion.header
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-black border border-blue-100 dark:border-blue-800 uppercase tracking-widest shadow-sm">
                            <Activity className="w-4 h-4" /> Active Workforce Deployment
                        </div>

                        <h1 className="text-7xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
                            Autonomous <br />
                            <span className="text-blue-600 dark:text-blue-500">Fleets.</span>
                        </h1>

                        <p className="text-2xl text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed max-w-lg">
                            "Manual prompting is a relic of the past. The G-Pilot era is defined by missions, objectives, and autonomous fleet synchronization."
                        </p>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <button className="h-20 px-12 bg-blue-600 text-white font-black text-2xl rounded-[1.5rem] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-transform active:scale-95 flex items-center gap-4">
                                Deploy Agents <ArrowRight className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 opacity-60">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-0.5">Sovereign Encryption Active</span>
                            </div>
                        </div>
                    </motion.header>

                    {/* Visual: The 8K Agent Fleet */}
                    <div className="relative h-[600px] flex items-center justify-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative w-full h-full rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl"
                        >
                            <Image
                                src="/agent_fleets_main.png"
                                alt="G-Pilot Agent Fleet"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Background Aura */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 dark:bg-blue-600 opacity-10 blur-[120px] rounded-full pointer-events-none" />
                    </div>
                </div>

                {/* Pillar Matrix */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-16">
                    {[
                        { title: "Recursive Correction", desc: "Agents autonomously detect failures in API responses or data structures, iterating logic until the mission goal is secured.", icon: Zap },
                        { title: "Long-Context Reasoning", desc: "Utilizing massive 1.5M+ token windows to ingest entire codebases or research volumes before executing a command.", icon: Search },
                        { title: "Coordinate Swarms", desc: "Synchronize multiple agents that share persistent state and mission outputs, acting as a single, multi-modal unit.", icon: Users }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="space-y-8 p-12 rounded-[4rem] bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.03] transition-all group"
                        >
                            <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-gray-100 dark:border-white/5 group-hover:bg-blue-600 transition-all duration-500 shadow-sm">
                                <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white leading-tight">{feature.title}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tactical CTA */}
                <section className="mt-40 p-20 rounded-[5rem] bg-gray-900 text-white relative overflow-hidden text-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-50" />
                    <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.75]">Experience <br />Fleet Sovereignty.</h2>
                        <p className="text-xl text-gray-400 font-medium">Deploy your first vanguard agent today and command the unknown with G-Pilot.</p>
                        <button className="h-20 px-16 bg-blue-600 text-white font-black text-2xl rounded-[1.5rem] hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-blue-600/30 flex items-center gap-4 mx-auto">
                            Scale Now <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}
