'use client';

import { motion } from 'framer-motion';
import { HeroGradient } from './HeroGradient';
import { ParticleField } from './ParticleField';
import { TextReveal } from './TextReveal';
import { GlowButton } from './GlowButton';
import { BreathingOrb } from './BreathingOrb';
import { EASINGS, DURATIONS } from '@/lib/design-tokens';

export interface CARSIHeroProps {
  /** Main headline */
  headline?: string;
  /** Tagline text */
  tagline?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA click handler */
  onCtaClick?: () => void;
  /** Feature items */
  features?: string[];
  /** Additional class names */
  className?: string;
}

const defaultFeatures = ['100% Online', 'Industry Certified', 'Learn Anywhere'];

export function CARSIHero({
  headline = 'CARSI Australia',
  tagline = 'Master the Science of Restoration',
  subtitle = "Australia's Premier 100% Online Restoration Training. Expert Certification. Zero Travel Costs.",
  ctaText = 'Start Your Journey Today',
  onCtaClick,
  features = defaultFeatures,
  className = '',
}: CARSIHeroProps) {
  return (
    <section
      className={`relative min-h-[600px] overflow-hidden flex flex-col items-center justify-center py-20 px-6 ${className}`}
    >
      {/* Animated gradient background */}
      <HeroGradient />

      {/* Particle field */}
      <ParticleField count={50} colour="cyan" direction="up" />

      {/* Content container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo/headline with gradient text */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATIONS.slow, ease: EASINGS.outExpo }}
        >
          <span className="bg-gradient-to-r from-[#00F5FF] to-[#00FF88] bg-clip-text text-transparent">
            {headline.split(' ')[0]}
          </span>{' '}
          <span className="text-[#FF6B35]">{headline.split(' ').slice(1).join(' ')}</span>
        </motion.h1>

        {/* Tagline with text reveal */}
        <div className="mb-4">
          <TextReveal
            text={tagline}
            mode="words"
            delay={0.3}
            stagger={0.08}
            className="text-2xl md:text-3xl font-semibold text-white justify-center"
          />
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-base md:text-lg text-white/80 max-w-lg mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: DURATIONS.normal }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: DURATIONS.normal, ease: EASINGS.outExpo }}
        >
          <GlowButton
            colour="amber"
            size="lg"
            onClick={onCtaClick}
            className="font-bold"
          >
            {ctaText}
          </GlowButton>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: DURATIONS.normal }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              className="flex items-center gap-2 text-white/90 text-sm md:text-base"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 1.3 + index * 0.1,
                duration: DURATIONS.normal,
                ease: EASINGS.outExpo,
              }}
            >
              <BreathingOrb colour="emerald" size={20} intensity="high" />
              <span>{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
    </section>
  );
}

export default CARSIHero;
