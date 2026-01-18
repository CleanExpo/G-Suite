"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface TacticalTabsProps {
    tabs: Tab[];
    id?: string;
}

export function TacticalTabs({ tabs, id }: TacticalTabsProps) {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return (
        <div id={id} className="space-y-16">
            {/* Tab Launcher */}
            <div className="flex flex-wrap justify-center gap-4 p-2 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] max-w-2xl mx-auto backdrop-blur-md">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? "text-white"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Matrix */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full"
                >
                    {tabs.find((t) => t.id === activeTab)?.content}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
