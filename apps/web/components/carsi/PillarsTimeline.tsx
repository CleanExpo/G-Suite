'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BreathingOrb } from './BreathingOrb';
import { SPECTRAL, EASINGS, DURATIONS, type SpectralColour } from '@/lib/design-tokens';

export interface Pillar {
  /** Pillar title */
  title: string;
  /** Pillar description */
  description: string;
  /** Optional spectral colour for this pillar */
  colour?: SpectralColour;
}

export interface PillarsTimelineProps {
  /** Section title */
  title?: string;
  /** Array of pillars (optional, uses defaults if not provided) */
  pillars?: Pillar[];
  /** Additional class names */
  className?: string;
}

const defaultPillars: Pillar[] = [
  {
    title: 'Authority & Accreditation',
    description: 'Industry-standard certifications from qualified experts',
    colour: 'cyan',
  },
  {
    title: 'Barrier-Free Learning',
    description: '100% online, accessible anywhere in Australia',
    colour: 'emerald',
  },
  {
    title: 'Career Transformation',
    description: 'Higher pay, bigger contracts, proven ROI',
    colour: 'amber',
  },
];

export function PillarsTimeline({
  title = 'The Restoration Edge: 3 Strategic Pillars',
  pillars = defaultPillars,
  className = '',
}: PillarsTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className={`py-16 px-6 ${className}`}>
      {/* Section title */}
      <motion.h2
        className="text-2xl md:text-3xl font-light text-center mb-12 text-white/90"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: DURATIONS.normal, ease: EASINGS.outExpo }}
      >
        {title}
      </motion.h2>

      {/* Timeline container */}
      <div className="relative max-w-2xl mx-auto">
        {/* Vertical connector line */}
        <motion.div
          className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent"
          initial={{ scaleY: 0, originY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 1, ease: EASINGS.outExpo, delay: 0.3 }}
        />

        {/* Pillar items */}
        <div className="space-y-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="relative flex items-start gap-6 pl-4"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.5 + index * 0.2,
                duration: DURATIONS.normal,
                ease: EASINGS.outExpo,
              }}
            >
              {/* Timeline node - breathing orb */}
              <div className="relative z-10 flex-shrink-0">
                <BreathingOrb
                  colour={pillar.colour ?? 'cyan'}
                  size={24}
                  intensity="high"
                />
              </div>

              {/* Content card */}
              <motion.div
                className="flex-1 bg-white/[0.03] border-[0.5px] border-white/[0.06] rounded-sm p-6"
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: SPECTRAL[pillar.colour ?? 'cyan'],
                }}
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transition: { duration: 0.2 },
                }}
              >
                {/* Pillar number */}
                <motion.span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-3"
                  style={{
                    backgroundColor: SPECTRAL[pillar.colour ?? 'cyan'],
                    color: '#050505',
                  }}
                >
                  {index + 1}
                </motion.span>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">{pillar.title}</h3>

                {/* Description */}
                <p className="text-sm text-white/60">{pillar.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PillarsTimeline;
