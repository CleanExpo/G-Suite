'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { useTilt } from '@/hooks/use-tilt';
import { EASINGS, DURATIONS, SPECTRAL, type SpectralColour } from '@/lib/design-tokens';

export interface GlassmorphicCardProps {
  /** Card content */
  children: ReactNode;
  /** Enable 3D tilt effect */
  enableTilt?: boolean;
  /** Maximum tilt angle */
  maxTilt?: number;
  /** Enable shimmer effect on hover */
  enableShimmer?: boolean;
  /** Accent colour for border glow */
  accentColour?: SpectralColour;
  /** Card label/header */
  label?: string;
  /** Additional class names */
  className?: string;
}

export function GlassmorphicCard({
  children,
  enableTilt = true,
  maxTilt = 8,
  enableShimmer = true,
  accentColour = 'cyan',
  label,
  className = '',
}: GlassmorphicCardProps) {
  const { ref: tiltRef, style: tiltStyle, onMouseEnter, onMouseMove, onMouseLeave } = useTilt({
    maxTilt,
    enabled: enableTilt,
    scale: 1.02,
  });

  const spectralColour = SPECTRAL[accentColour];

  return (
    <motion.div
      ref={tiltRef}
      className={`
        relative overflow-hidden
        bg-white/[0.02] backdrop-blur-xl
        border-[0.5px] border-white/[0.06]
        rounded-sm
        ${className}
      `}
      style={enableTilt ? tiltStyle : undefined}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: DURATIONS.normal, ease: EASINGS.outExpo }}
    >
        {/* Shimmer effect overlay */}
        {enableShimmer && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${spectralColour}10 50%, transparent 60%)`,
              backgroundSize: '200% 100%',
            }}
            initial={{ backgroundPosition: '200% 0' }}
            whileHover={{
              backgroundPosition: '-200% 0',
              transition: { duration: 0.8, ease: 'easeOut' },
            }}
          />
        )}

        {/* Label header */}
        {label && (
          <div
            className="px-5 py-3 border-b-[0.5px] border-white/[0.06] font-mono text-xs uppercase tracking-wider"
            style={{
              backgroundColor: `${spectralColour}10`,
              color: spectralColour,
            }}
          >
            {label}
          </div>
        )}

        {/* Card content */}
        <div className="relative z-10">{children}</div>

      {/* Bottom glow on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ backgroundColor: spectralColour }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default GlassmorphicCard;
