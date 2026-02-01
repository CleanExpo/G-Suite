'use client';

import { motion } from 'framer-motion';
import { SPECTRAL, DURATIONS, type SpectralColour } from '@/lib/design-tokens';

export interface BreathingOrbProps {
  /** Spectral colour for the orb */
  colour?: SpectralColour;
  /** Custom hex colour (overrides colour prop) */
  hexColour?: string;
  /** Size in pixels */
  size?: number;
  /** Animation intensity */
  intensity?: 'low' | 'medium' | 'high';
  /** Additional class names */
  className?: string;
}

const intensityConfig = {
  low: { opacityRange: [0.2, 0.4, 0.2], scaleRange: [0.95, 1, 0.95], glowMultiplier: 0.5 },
  medium: { opacityRange: [0.3, 0.6, 0.3], scaleRange: [0.9, 1, 0.9], glowMultiplier: 1 },
  high: { opacityRange: [0.4, 0.8, 0.4], scaleRange: [0.85, 1.05, 0.85], glowMultiplier: 1.5 },
};

export function BreathingOrb({
  colour = 'cyan',
  hexColour,
  size = 12,
  intensity = 'medium',
  className = '',
}: BreathingOrbProps) {
  const actualColour = hexColour ?? SPECTRAL[colour];
  const config = intensityConfig[intensity];

  return (
    <motion.div
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: actualColour,
      }}
      animate={{
        opacity: config.opacityRange,
        scale: config.scaleRange,
        boxShadow: [
          `0 0 ${20 * config.glowMultiplier}px ${actualColour}40`,
          `0 0 ${40 * config.glowMultiplier}px ${actualColour}60`,
          `0 0 ${20 * config.glowMultiplier}px ${actualColour}40`,
        ],
      }}
      transition={{
        duration: DURATIONS.breathing,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default BreathingOrb;
