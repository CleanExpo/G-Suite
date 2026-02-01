'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { SPECTRAL, EASINGS, DURATIONS } from '@/lib/design-tokens';

export type SocialPlatform = 'linkedin' | 'facebook' | 'instagram';

export interface SocialMediaCardProps {
  /** Social media platform */
  platform: SocialPlatform;
  /** Account name */
  accountName: string;
  /** Account handle or follower info */
  accountMeta: string;
  /** Image headline */
  imageHeadline: string;
  /** Image subtext */
  imageSubtext: string;
  /** Post body text */
  bodyText: string;
  /** Secondary body text */
  bodyTextSecondary?: string;
  /** Hashtags (for Facebook/Instagram) */
  hashtags?: string;
  /** CTA text */
  ctaText?: string;
  /** Additional class names */
  className?: string;
}

const platformConfig: Record<
  SocialPlatform,
  { gradient: string; accentColour: string; actions: string[] }
> = {
  linkedin: {
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #0D2137 50%, #2E7D32 100%)',
    accentColour: SPECTRAL.cyan,
    actions: ['Like', 'Comment', 'Repost', 'Send'],
  },
  facebook: {
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0D47A1 100%)',
    accentColour: '#1877F2',
    actions: ['Like', 'Comment', 'Share'],
  },
  instagram: {
    gradient: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
    accentColour: SPECTRAL.magenta,
    actions: ['Like', 'Comment', 'Share', 'Save'],
  },
};

export function SocialMediaCard({
  platform,
  accountName,
  accountMeta,
  imageHeadline,
  imageSubtext,
  bodyText,
  bodyTextSecondary,
  hashtags,
  ctaText,
  className = '',
}: SocialMediaCardProps) {
  const config = platformConfig[platform];

  return (
    <GlassmorphicCard
      label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Post`}
      accentColour={platform === 'instagram' ? 'magenta' : 'cyan'}
      className={className}
    >
      {/* Social post inner (white background simulation) */}
      <div className="bg-white text-[#1a1a1a]">
        {/* Header with avatar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: config.gradient }}
          >
            CA
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{accountName}</div>
            <div className="text-sm text-gray-500">{accountMeta}</div>
          </div>
        </div>

        {/* Image area */}
        <motion.div
          className="relative p-8 text-center text-white overflow-hidden"
          style={{
            background: config.gradient,
            aspectRatio: platform === 'instagram' ? '1/1' : '1.91/1',
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: EASINGS.outExpo }}
        >
          {/* Overlay pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="absolute -right-8 -bottom-8 text-[120px] opacity-20"
              aria-hidden="true"
            >
              {platform === 'linkedin' && '🎓'}
              {platform === 'facebook' && '🔧'}
              {platform === 'instagram' && '🏠'}
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold mb-3 relative z-10 leading-tight">
            {imageHeadline}
          </h3>
          <p className="text-base opacity-90 relative z-10">{imageSubtext}</p>
        </motion.div>

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed">{bodyText}</p>
          {bodyTextSecondary && (
            <p className="text-sm text-gray-700 leading-relaxed mt-3">{bodyTextSecondary}</p>
          )}
          {ctaText && (
            <p className="text-sm font-semibold text-gray-900 mt-3">{ctaText}</p>
          )}
          {hashtags && (
            <p className="text-sm text-blue-600 mt-2">{hashtags}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-6 px-4 py-3 border-t border-gray-100 text-gray-500 text-sm">
          {config.actions.map((action) => (
            <motion.span
              key={action}
              className="cursor-pointer hover:text-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action}
            </motion.span>
          ))}
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default SocialMediaCard;
