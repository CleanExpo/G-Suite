'use client';

import { motion } from 'framer-motion';

export interface HeroGradientProps {
  /** Primary colour for gradient */
  primaryColour?: string;
  /** Secondary colour for gradient */
  secondaryColour?: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Additional class names */
  className?: string;
}

export function HeroGradient({
  primaryColour = '#1E3A5F',
  secondaryColour = '#2E7D32',
  duration = 8,
  className = '',
}: HeroGradientProps) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      animate={{
        background: [
          `linear-gradient(135deg, ${primaryColour} 0%, #0D2137 50%, ${secondaryColour} 100%)`,
          `linear-gradient(155deg, ${primaryColour} 0%, #0D2137 60%, ${secondaryColour} 100%)`,
          `linear-gradient(135deg, ${primaryColour} 0%, #0D2137 50%, ${secondaryColour} 100%)`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Radial glow overlays */}
      <div
        className="absolute -right-[20%] -top-[50%] h-[500px] w-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-[30%] -left-[10%] h-[400px] w-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}

export default HeroGradient;
