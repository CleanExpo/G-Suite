'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReactNode } from 'react';

interface TacticalBoxProps {
  title: string | ReactNode;
  description: string;
  image?: string;
  children?: ReactNode;
  className?: string;
  id?: string;
  badge?: string;
  accent?: string;
}

export function TacticalBox({
  title,
  description,
  image,
  children,
  className = '',
  id,
  badge,
  accent,
}: TacticalBoxProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}
      className={`group p-6 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 relative overflow-hidden perspective-[2000px] ${className}`}
    >
      {/* 3D Depth Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full group-hover:bg-blue-600/15 transition-colors pointer-events-none" />

      <div className="relative z-10 space-y-10">
        {image && (
          <motion.div
            whileHover={{ translateZ: 50, scale: 1.1 }}
            className="w-32 h-32 relative mx-auto mb-6 transform-style-3d group-hover:drop-shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
          >
            {/* Circular Glass Medallion Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 dark:border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md shadow-xl" />

            {/* Asset Container */}
            <div className="absolute inset-2 rounded-full overflow-hidden bg-[#0b0e14] flex items-center justify-center p-2">
              <Image
                src={image}
                alt="Feature Illustration"
                fill
                className="object-cover scale-110"
              />
            </div>

            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter dark:text-white leading-tight underline decoration-blue-600/10 underline-offset-8 group-hover:decoration-blue-600/50 transition-all">
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
          <div className="pt-6 border-t border-gray-100 dark:border-white/5">{children}</div>
        )}
      </div>
    </motion.div>
  );
}
