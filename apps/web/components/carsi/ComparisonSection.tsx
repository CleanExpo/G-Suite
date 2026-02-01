'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BreathingOrb } from './BreathingOrb';
import { SPECTRAL, EASINGS, DURATIONS } from '@/lib/design-tokens';

interface ComparisonItem {
  text: string;
  positive: boolean;
}

export interface ComparisonSectionProps {
  /** Title for "old way" side */
  oldTitle?: string;
  /** Title for "new way" side */
  newTitle?: string;
  /** Items for old way */
  oldItems?: ComparisonItem[];
  /** Items for new way */
  newItems?: ComparisonItem[];
  /** Additional class names */
  className?: string;
}

const defaultOldItems: ComparisonItem[] = [
  { text: 'Expensive flights', positive: false },
  { text: 'Hotel costs', positive: false },
  { text: 'Lost work days', positive: false },
  { text: 'Limited schedules', positive: false },
];

const defaultNewItems: ComparisonItem[] = [
  { text: 'Zero travel', positive: true },
  { text: 'Learn from home', positive: true },
  { text: 'Flexible timing', positive: true },
  { text: 'Same certification', positive: true },
];

// SVG Icons
function PlaneIcon() {
  return (
    <svg
      className="w-16 h-16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg
      className="w-16 h-16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
      <path d="M12 17v3" />
    </svg>
  );
}

export function ComparisonSection({
  oldTitle = 'The Old Way',
  newTitle = 'The CARSI Way',
  oldItems = defaultOldItems,
  newItems = defaultNewItems,
  className = '',
}: ComparisonSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={containerRef}
      className={`py-16 ${className}`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-0 rounded-sm overflow-hidden border-[0.5px] border-white/[0.06]"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DURATIONS.slow, ease: EASINGS.outExpo }}
        >
          {/* Old Way Side (40%) */}
          <motion.div
            className="relative p-8 text-center"
            style={{ backgroundColor: `${SPECTRAL.red}20` }}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: DURATIONS.normal, ease: EASINGS.outExpo }}
          >
            {/* Spectral glow overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${SPECTRAL.red}15 0%, transparent 70%)`,
              }}
            />

            <h3 className="text-xl font-semibold mb-6 relative z-10" style={{ color: SPECTRAL.red }}>
              {oldTitle}
            </h3>

            {/* Icon */}
            <div className="mb-6 flex justify-center relative z-10 opacity-60">
              <PlaneIcon />
            </div>

            {/* Items */}
            <ul className="space-y-3 text-left relative z-10">
              {oldItems.map((item, index) => (
                <motion.li
                  key={item.text}
                  className="flex items-center gap-3 text-white/80"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: DURATIONS.fast,
                    ease: EASINGS.outExpo,
                  }}
                >
                  <BreathingOrb colour="red" size={8} intensity="low" />
                  <span className="text-sm">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* New Way Side (60%) */}
          <motion.div
            className="relative p-8 text-center"
            style={{ backgroundColor: `${SPECTRAL.emerald}15` }}
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: DURATIONS.normal, ease: EASINGS.outExpo }}
          >
            {/* Spectral glow overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${SPECTRAL.emerald}15 0%, transparent 70%)`,
              }}
            />

            <h3 className="text-xl font-semibold mb-6 relative z-10" style={{ color: SPECTRAL.emerald }}>
              {newTitle}
            </h3>

            {/* Icon */}
            <div className="mb-6 flex justify-center relative z-10 opacity-80">
              <LaptopIcon />
            </div>

            {/* Items */}
            <ul className="space-y-3 text-left relative z-10">
              {newItems.map((item, index) => (
                <motion.li
                  key={item.text}
                  className="flex items-center gap-3 text-white/90"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    duration: DURATIONS.fast,
                    ease: EASINGS.outExpo,
                  }}
                >
                  <BreathingOrb colour="emerald" size={10} intensity="high" />
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default ComparisonSection;
