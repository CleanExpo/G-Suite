'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { GlowButton } from './GlowButton';
import { SPECTRAL, EASINGS, DURATIONS } from '@/lib/design-tokens';

export interface EmailCardProps {
  /** Email label (e.g., "Email 1 / Cost Barrier") */
  label: string;
  /** Email subject line */
  subject: string;
  /** Email heading */
  heading: string;
  /** Body paragraphs */
  bodyParagraphs: string[];
  /** CTA button text */
  ctaText: string;
  /** Logo text parts [main, accent] */
  logoText?: [string, string];
  /** Additional class names */
  className?: string;
}

export function EmailCard({
  label,
  subject,
  heading,
  bodyParagraphs,
  ctaText,
  logoText = ['CARSI', 'Australia'],
  className = '',
}: EmailCardProps) {
  return (
    <GlassmorphicCard
      label={label}
      accentColour="cyan"
      className={className}
    >
      {/* Email preview (white background) */}
      <div className="bg-white text-gray-800">
        {/* Email header with gradient */}
        <div
          className="py-8 px-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2E7D32 100%)',
          }}
        >
          <motion.div
            className="text-2xl font-extrabold text-white"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATIONS.normal }}
          >
            {logoText[0]}{' '}
            <span style={{ color: SPECTRAL.amber }}>{logoText[1]}</span>
          </motion.div>
        </div>

        {/* Subject line bar */}
        <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            <strong className="text-[#1E3A5F]">Subject:</strong> {subject}
          </span>
        </div>

        {/* Email body */}
        <div className="px-6 py-8">
          <motion.h3
            className="text-xl font-semibold text-[#1E3A5F] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {heading}
          </motion.h3>

          {bodyParagraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              className="text-gray-700 leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.05 }}
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}

          {/* CTA Button */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <button
              className="inline-block px-8 py-3 font-semibold text-white rounded-sm"
              style={{ backgroundColor: SPECTRAL.amber }}
            >
              {ctaText}
            </button>
          </motion.div>
        </div>

        {/* Email footer */}
        <div className="bg-gray-100 px-6 py-4 text-center text-xs text-gray-500">
          CARSI Australia &bull; Professional Restoration Training
          <br />
          <span className="text-gray-400">Unsubscribe | Privacy Policy</span>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default EmailCard;
