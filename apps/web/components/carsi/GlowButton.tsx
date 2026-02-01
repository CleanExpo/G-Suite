'use client';

import { motion } from 'framer-motion';
import { SPECTRAL, EASINGS, DURATIONS, type SpectralColour } from '@/lib/design-tokens';
import { type ReactNode } from 'react';

export interface GlowButtonProps {
  /** Button content */
  children: ReactNode;
  /** Spectral colour for glow effect */
  colour?: SpectralColour;
  /** Button variant */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disable pulse animation */
  disablePulse?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

const sizeConfig = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function GlowButton({
  children,
  colour = 'cyan',
  variant = 'solid',
  size = 'md',
  disablePulse = false,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
}: GlowButtonProps) {
    const spectralColour = SPECTRAL[colour];

    const baseStyles = `
      relative overflow-hidden font-semibold tracking-wide
      rounded-sm border-[0.5px] transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeConfig[size]}
      ${fullWidth ? 'w-full' : ''}
    `;

    const variantStyles = {
      solid: `bg-[${spectralColour}] text-[#050505] border-transparent hover:brightness-110`,
      outline: `bg-transparent text-white border-[${spectralColour}]/50 hover:bg-[${spectralColour}]/10`,
      ghost: `bg-transparent text-white/70 border-transparent hover:text-white hover:bg-white/5`,
    };

  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${className}`}
      style={{
        backgroundColor: variant === 'solid' ? spectralColour : 'transparent',
        color: variant === 'solid' ? '#050505' : 'white',
        borderColor: variant === 'outline' ? `${spectralColour}50` : 'transparent',
      }}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.02,
              transition: { duration: 0.2, ease: EASINGS.outExpo },
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
      }
      disabled={disabled}
      onClick={onClick}
    >
        {/* Pulse ring effect */}
        {!disablePulse && !disabled && (
          <motion.span
            className="absolute inset-0 rounded-sm"
            style={{ border: `1px solid ${spectralColour}` }}
            animate={{
              opacity: [0.6, 0, 0.6],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: DURATIONS.breathing,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export default GlowButton;
