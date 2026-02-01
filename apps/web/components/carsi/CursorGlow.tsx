'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';
import { SPECTRAL, type SpectralColour } from '@/lib/design-tokens';

export interface CursorGlowProps {
  /** Colour for the glow */
  colour?: SpectralColour;
  /** Size of the glow orb in pixels */
  size?: number;
  /** Enable/disable the effect */
  enabled?: boolean;
}

export function CursorGlow({
  colour = 'cyan',
  size = 400,
  enabled = true,
}: CursorGlowProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;

  const spectralColour = SPECTRAL[colour];

  return (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background: `radial-gradient(circle, ${spectralColour}15 0%, ${spectralColour}05 30%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
    />
  );
}

export default CursorGlow;
