'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { SPECTRAL, type SpectralColour } from '@/lib/design-tokens';

export interface ParticleFieldProps {
  /** Number of particles */
  count?: number;
  /** Spectral colour for particles */
  colour?: SpectralColour;
  /** Custom hex colour (overrides colour prop) */
  hexColour?: string;
  /** Minimum particle size in pixels */
  minSize?: number;
  /** Maximum particle size in pixels */
  maxSize?: number;
  /** Minimum animation duration in seconds */
  minDuration?: number;
  /** Maximum animation duration in seconds */
  maxDuration?: number;
  /** Direction of particle movement */
  direction?: 'up' | 'down' | 'left' | 'right' | 'random';
  /** Additional class names */
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  direction: { x: number; y: number };
}

function getDirectionVector(direction: ParticleFieldProps['direction']): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: -100 };
    case 'down':
      return { x: 0, y: 100 };
    case 'left':
      return { x: -100, y: 0 };
    case 'right':
      return { x: 100, y: 0 };
    case 'random':
    default:
      return {
        x: (Math.random() - 0.5) * 100,
        y: -50 - Math.random() * 50,
      };
  }
}

export function ParticleField({
  count = 50,
  colour = 'cyan',
  hexColour,
  minSize = 2,
  maxSize = 4,
  minDuration = 15,
  maxDuration = 25,
  direction = 'up',
  className = '',
}: ParticleFieldProps) {
  const actualColour = hexColour ?? SPECTRAL[colour];

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: minDuration + Math.random() * (maxDuration - minDuration),
      delay: Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.2,
      direction: getDirectionVector(direction === 'random' ? 'random' : direction),
    }));
  }, [count, minSize, maxSize, minDuration, maxDuration, direction]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: actualColour,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, particle.direction.y],
            x: [0, particle.direction.x],
            opacity: [particle.opacity, particle.opacity * 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default ParticleField;
