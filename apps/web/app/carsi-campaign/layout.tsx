import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CARSI Australia - The Restoration Edge Campaign',
  description:
    "Australia's Premier 100% Online Restoration Training. Expert Certification. Zero Travel Costs.",
  keywords: [
    'CARSI',
    'Australia',
    'restoration training',
    'mould remediation',
    'water damage',
    'online certification',
  ],
};

export default function CARSICampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">
      {children}
    </div>
  );
}
