"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-24 px-6 bg-white dark:bg-[#0b0e14] border-t border-gray-100 dark:border-white/5 transition-colors">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">

                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1 space-y-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-100 dark:border-white/10 shadow-sm">
                            <Image
                                src="/logo-light.png"
                                alt="G-Pilot"
                                fill
                                className="object-cover dark:hidden"
                            />
                            <Image
                                src="/logo-dark.png"
                                alt="G-Pilot"
                                fill
                                className="object-cover hidden dark:block"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight leading-none">G-Pilot</span>
                            <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Gemini Suite</span>
                        </div>
                    </Link>
                    <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed italic">
                        "Orchestrating the future of autonomous agent intelligence. Built for world-class founders and the teams that support them."
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-600 transition-colors"><Twitter className="w-5 h-5" /></Link>
                        <Link href="#" className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-600 transition-colors"><Github className="w-5 h-5" /></Link>
                        <Link href="#" className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></Link>
                    </div>
                </div>

                {/* Links Columns */}
                <div>
                    <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-8 underline decoration-blue-600/30 underline-offset-8">Platform</h4>
                    <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <li><Link href="/platform" className="hover:text-blue-600 transition-colors">Infrastructure</Link></li>
                        <li><Link href="/platform/security" className="hover:text-blue-600 transition-colors">Vault Security</Link></li>
                        <li><Link href="/abilities" className="hover:text-blue-600 transition-colors italic font-bold">Codex</Link></li>
                        <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-8 underline decoration-blue-600/30 underline-offset-8">Solutions</h4>
                    <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <li><Link href="/solutions/agents" className="hover:text-blue-600 transition-colors">Agent Fleets</Link></li>
                        <li><Link href="/solutions/workflows" className="hover:text-blue-600 transition-colors">Smarter Workflows</Link></li>
                        <li><Link href="/intel" className="hover:text-blue-600 transition-colors">Intelligence Library</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-8 underline decoration-blue-600/30 underline-offset-8">Legal</h4>
                    <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy & Sharing</Link></li>
                        <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="flex items-center gap-1 hover:text-blue-600 transition-colors">Google TOS <ExternalLink className="w-3 h-3" /></Link></li>
                    </ul>
                </div>

            </div>

            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>© 2026 G-Pilot App. All Rights Reserved.</span>
                <div className="flex gap-8">
                    <span className="text-emerald-500">System Status: Operational</span>
                    <span className="text-blue-500">v4.2.0-spatial</span>
                </div>
            </div>
        </footer>
    );
}
