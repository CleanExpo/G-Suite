'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SPECTRAL, EASINGS, DURATIONS } from '@/lib/design-tokens';
import { useCountUp } from '@/hooks/use-count-up';

export interface StatItem {
  /** Numeric value (end target) */
  value: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%", "+", "K") */
  suffix?: string;
  /** Label text */
  label: string;
  /** Decimal places */
  decimals?: number;
}

export interface StatsStripProps {
  /** Array of stat items */
  stats: StatItem[];
  /** Additional class names */
  className?: string;
}

function StatCounter({
  value,
  prefix = '',
  suffix = '',
  label,
  decimals = 0,
  index,
}: StatItem & { index: number }) {
  const { value: displayValue, ref } = useCountUp({
    end: value,
    prefix,
    suffix,
    decimals,
    duration: 2000,
    easing: 'easeOut',
  });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex flex-col items-center px-8 py-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        delay: index * 0.15,
        duration: DURATIONS.normal,
        ease: EASINGS.outExpo,
      }}
    >
      <span
        className="font-mono text-3xl md:text-4xl font-bold tabular-nums"
        style={{ color: SPECTRAL.cyan }}
      >
        {displayValue}
      </span>
      <span className="text-xs md:text-sm text-white/60 mt-2 text-center uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}

export function StatsStrip({ stats, className = '' }: StatsStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={containerRef}
      className={`
        flex flex-wrap items-center justify-center
        bg-white/[0.02] backdrop-blur-sm
        border-[0.5px] border-white/[0.06]
        rounded-sm overflow-hidden
        ${className}
      `}
      initial={{ opacity: 0, scaleX: 0.8 }}
      animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
      transition={{ duration: DURATIONS.slow, ease: EASINGS.outExpo }}
    >
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex items-center">
          <StatCounter {...stat} index={index} />
          {index < stats.length - 1 && (
            <div className="w-px h-12 bg-white/[0.06] hidden md:block" />
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default StatsStrip;
