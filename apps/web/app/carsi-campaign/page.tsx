'use client';

import { motion } from 'framer-motion';
import {
  CARSIHero,
  StatsStrip,
  PillarsTimeline,
  ComparisonSection,
  SocialMediaCard,
  EmailCard,
  GlassmorphicCard,
  SectionHeader,
  CursorGlow,
  BreathingOrb,
  ParticleField,
} from '@/components/carsi';
import { SPECTRAL, EASINGS, DURATIONS } from '@/lib/design-tokens';

// Stats data
const campaignStats = [
  { value: 40, suffix: '%', label: 'Enrollment Growth Target' },
  { value: 100, suffix: '%', label: 'Online Delivery' },
  { value: 2, prefix: '$', suffix: 'K+', label: 'Saved on Travel Costs' },
  { value: 25, suffix: '%', label: 'Higher Earnings' },
];

// Social media posts data
const linkedInPost = {
  platform: 'linkedin' as const,
  accountName: 'CARSI Australia',
  accountMeta: '1,247 followers • Education',
  imageHeadline: 'Stop Paying for\nYour Team\'s Flights',
  imageSubtext: 'Professional restoration training without leaving the job site',
  bodyText:
    'Upskilling your team shouldn\'t cost you a week of lost productivity and $2k in travel expenses.',
  bodyTextSecondary:
    'With CARSI, your staff gets top-tier restoration certification from the warehouse or home. 🏠',
  ctaText: 'See our corporate packages →',
};

const facebookPost = {
  platform: 'facebook' as const,
  accountName: 'CARSI Australia',
  accountMeta: 'Sponsored • 🌏',
  imageHeadline: 'Why Travel for Training?',
  imageSubtext: 'The training comes to you 🚛💻',
  bodyText: 'Master Water Damage & Mould Remediation 100% online.',
  bodyTextSecondary: 'Get certified ✅ Get more insurance work ✅ Get paid more ✅',
  hashtags: '#RestorationLife #Tradie #OnlineLearning #MouldRemoval #AusTrade',
};

const instagramPost = {
  platform: 'instagram' as const,
  accountName: 'carsi_australia',
  accountMeta: 'Restoration Training',
  imageHeadline: '3 Deadliest Mould Types\nin Aussie Homes',
  imageSubtext: 'Swipe to learn the science 🦠',
  bodyText: 'Think it\'s just a bit of black gunk? Think again. 🦠',
  bodyTextSecondary:
    'Identifying the risk is step one of the job. Learn the science behind the clean with CARSI.',
  ctaText: '🔗 Link in bio to start your free trial module',
};

// Email templates data
const emails = [
  {
    label: 'Email 1 / Cost Barrier',
    subject: '✈️ Why pay for flights? (Training shouldn\'t cost this much)',
    heading: 'There\'s a better way to get certified',
    bodyParagraphs: [
      'Hey there,',
      'We know what you\'re thinking: "Quality restoration training requires flying to Sydney or Melbourne."',
      'Not anymore. CARSI delivers the same industry-standard certifications—100% online, from anywhere in Australia.',
      '<strong>No flights. No hotels. No lost workdays.</strong>',
    ],
    ctaText: 'Calculate Your Savings →',
  },
  {
    label: 'Email 2 / Knowledge Gap',
    subject: 'Is your restoration knowledge up to code? [Quiz Inside]',
    heading: 'Quick Quiz: Test Your Expertise',
    bodyParagraphs: [
      'Can you answer these 3 questions?',
      '1. What\'s the ideal relative humidity for structural drying?<br/>2. At what moisture content is wood considered "dry"?<br/>3. Name the IICRC standard for mould remediation.',
      'If you hesitated on any... there\'s a gap in your training.',
    ],
    ctaText: 'Fill the Gap with CARSI →',
  },
  {
    label: 'Email 3 / Social Proof',
    subject: '🎓 Case Study: How Sarah doubled her charge-out rate',
    heading: 'From $65/hr to $130/hr in 6 months',
    bodyParagraphs: [
      'Sarah runs a small restoration business in regional Queensland.',
      'After completing CARSI\'s Water Damage Restoration course, she got certified for insurance work—and doubled her rates overnight.',
      '<em>"The best part? I studied between jobs. Never had to leave town."</em>',
    ],
    ctaText: 'Read Sarah\'s Full Story →',
  },
];

export default function CARSICampaignPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Ambient cursor glow */}
      <CursorGlow colour="cyan" size={500} />

      {/* Hero Section */}
      <CARSIHero
        headline="CARSI Australia"
        tagline="Master the Science of Restoration"
        subtitle="Australia's Premier 100% Online Restoration Training. Expert Certification. Zero Travel Costs."
        ctaText="Start Your Journey Today"
        features={['100% Online', 'Industry Certified', 'Learn Anywhere']}
      />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Section: Hero Banners */}
        <section className="mb-20">
          <SectionHeader
            number="01"
            title="Hero Banners"
            description="Primary campaign banners for website, ads, and landing pages"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Pillars Timeline */}
            <GlassmorphicCard label="Campaign Pillars / Infographic" enableTilt={false}>
              <div className="p-6">
                <PillarsTimeline
                  title="The Restoration Edge: 3 Strategic Pillars"
                  className="py-0"
                />
              </div>
            </GlassmorphicCard>
          </div>
        </section>

        {/* Section: Statistics */}
        <section className="mb-20">
          <SectionHeader
            number="02"
            title="Statistics & Infographics"
            description="Data-driven visuals for credibility and social proof"
          />

          <StatsStrip stats={campaignStats} className="mb-8" />

          <ComparisonSection />
        </section>

        {/* Section: Social Media */}
        <section className="mb-20">
          <SectionHeader
            number="03"
            title="Social Media Posts"
            description="Ready-to-publish content for LinkedIn, Facebook, and Instagram"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <SocialMediaCard {...linkedInPost} />
            <SocialMediaCard {...facebookPost} />
            <SocialMediaCard {...instagramPost} />
          </div>
        </section>

        {/* Section: Email Templates */}
        <section className="mb-20">
          <SectionHeader
            number="04"
            title="Email Templates"
            description="Nurture sequence emails for lead conversion"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {emails.map((email) => (
              <EmailCard key={email.label} {...email} />
            ))}
          </div>
        </section>

        {/* Section: Additional Assets */}
        <section className="mb-20">
          <SectionHeader
            number="05"
            title="Additional Assets"
            description="Supporting visuals for the campaign"
          />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Geographic Reach */}
            <GlassmorphicCard label="Geographic Reach / Australia Map" accentColour="emerald">
              <div
                className="p-10 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #0D2137 100%)',
                }}
              >
                <ParticleField count={20} colour="cyan" className="opacity-50" />

                <h3 className="text-xl font-semibold text-white mb-6 relative z-10">
                  Training Without Borders
                </h3>

                {/* Stylized map representation */}
                <motion.div
                  className="relative z-10 my-8 flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: DURATIONS.slow, ease: EASINGS.outExpo }}
                >
                  <svg
                    width="200"
                    height="160"
                    viewBox="0 0 200 160"
                    fill="none"
                    className="opacity-30"
                  >
                    <path
                      d="M100 10 L140 40 L180 30 L190 80 L170 120 L140 150 L80 140 L40 110 L20 60 L50 20 Z"
                      stroke={SPECTRAL.cyan}
                      strokeWidth="1"
                      fill={`${SPECTRAL.cyan}10`}
                    />
                  </svg>
                </motion.div>

                <p className="text-lg font-semibold relative z-10" style={{ color: SPECTRAL.cyan }}>
                  "From the Pilbara to Parramatta"
                </p>
                <p className="text-sm text-white/70 mt-2 relative z-10">
                  Same world-class training, wherever you are
                </p>
              </div>
            </GlassmorphicCard>

            {/* Certificate Preview */}
            <GlassmorphicCard label="Certificate Preview / Credibility" accentColour="amber">
              <div
                className="p-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, #f5f0e6, #fff9ed)',
                  border: `8px double ${SPECTRAL.amber}`,
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#2E7D32' }}
                >
                  Certificate of Completion
                </p>
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-1">
                  CARSI Australia
                </h3>
                <p className="text-base" style={{ color: '#2E7D32' }}>
                  Water Damage Restoration
                </p>

                <p className="text-xl italic text-gray-700 my-6">[Your Name Here]</p>

                <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Has successfully completed the requirements for professional certification
                  in Water Damage Restoration as established by CARSI Australia.
                </p>

                <div className="flex justify-between mt-8 text-xs text-gray-500">
                  <span>Date: DD/MM/YYYY</span>
                  <span>Certificate ID: CARSI-WDR-XXXX</span>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t-[0.5px] border-white/[0.06] py-16 text-center">
        <p className="text-white/50 text-sm mb-2">
          Generated by G-Pilot Marketing Strategist Agent
        </p>
        <p className="font-mono text-xs" style={{ color: SPECTRAL.cyan }}>
          Campaign: The Restoration Edge &bull; CARSI Australia
        </p>

        <div className="flex justify-center gap-2 mt-6">
          <BreathingOrb colour="cyan" size={8} />
          <BreathingOrb colour="emerald" size={8} />
          <BreathingOrb colour="amber" size={8} />
        </div>
      </footer>
    </main>
  );
}
