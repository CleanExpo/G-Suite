'use client';

import { motion } from 'framer-motion';
import { SPECTRAL, EASINGS, DURATIONS } from '@/lib/design-tokens';

export interface SectionHeaderProps {
  /** Section number (e.g., "01") */
  number: string;
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Additional class names */
  className?: string;
}

export function SectionHeader({
  number,
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <motion.header
      className={`mb-10 pb-5 border-b-[0.5px] border-white/[0.06] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: DURATIONS.normal, ease: EASINGS.outExpo }}
    >
      <h2 className="text-xl md:text-2xl font-light tracking-tight mb-2">
        <span style={{ color: SPECTRAL.cyan }}>{number}</span>
        <span className="mx-3 text-white/20">/</span>
        <span className="text-white">{title}</span>
      </h2>
      <p className="text-sm text-white/50">{description}</p>
    </motion.header>
  );
}

export default SectionHeader;
