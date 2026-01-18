"use client"

import { motion } from "framer-motion";
import Image from "next/image";

interface LogoSectorProps {
    title: string;
    logos: { name: string; src: string }[];
    className?: string;
}

export function LogoSector({ title, logos, className = "" }: LogoSectorProps) {
    return (
        <div className={`space-y-12 ${className}`}>
            <div className="flex items-center gap-6">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-200 dark:to-white/10" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {title}
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-200 dark:to-white/10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 items-center justify-items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
                {logos.map((logo, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                        className="relative w-32 h-12 grayscale hover:grayscale-0 transition-all cursor-pointer"
                    >
                        <Image
                            src={logo.src}
                            alt={logo.name}
                            fill
                            className="object-contain"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
