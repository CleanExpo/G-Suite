"use client"

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface TacticalBoxProps {
    title: string | ReactNode;
    description: string;
    icon?: LucideIcon;
    children?: ReactNode;
    className?: string;
    id?: string;
    badge?: string;
    accent?: string;
}

export function TacticalBox({ title, description, icon: Icon, children, className = "", id, badge, accent }: TacticalBoxProps) {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`group p-12 rounded-[4rem] bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 transition-all hover:shadow-2xl hover:border-blue-500/30 relative overflow-hidden ${className}`}
        >
            {/* Spatial Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-colors pointer-events-none" />

            <div className="relative z-10 space-y-8">
                {Icon && (
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] flex items-center justify-center border border-blue-100 dark:border-blue-800 group-hover:bg-blue-600 transition-all duration-500 shadow-sm">
                        <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white leading-tight underline decoration-blue-600/10 underline-offset-8 group-hover:decoration-blue-600/50 transition-all">
                            {title}
                        </h3>
                        {badge && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-lg text-blue-700 dark:text-white shadow-sm">
                                {badge}
                            </span>
                        )}
                    </div>
                    {accent && (
                        <div className="font-serif-emphasis italic text-blue-600 dark:text-blue-400 text-sm">
                            {accent}
                        </div>
                    )}
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        {description}
                    </p>
                </div>

                {children && (
                    <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                        {children}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
