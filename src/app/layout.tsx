import type { Metadata } from 'next';
import { Inter, Outfit, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  style: 'italic',
});

const appUrl = 'https://g-pilot.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'G-Pilot - Enterprise AI Orchestration',
    template: '%s | G-Pilot',
  },
  description:
    'Orchestrate complex AI workflows with G-Pilot. The transparent, mission-driven platform for autonomous agent deployment and secure billing.',
  keywords: [
    'AI Orchestration',
    'Agentic Workflow',
    'G-Pilot',
    'Google Cloud',
    'AI Automation',
    'SaaS',
    'Billing Ledger',
    'Autonomous Agents',
  ],
  authors: [{ name: 'G-Pilot Team' }],
  creator: 'G-Pilot',
  publisher: 'G-Pilot Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'G-Pilot - Enterprise AI Orchestration',
    description:
      'Launch AI-driven missions with full workspace autonomy. Secure, transparent, and powerful.',
    url: appUrl,
    siteName: 'G-Pilot App',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'G-Pilot Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'G-Pilot - AI Orchestration',
    description: 'Launch AI-driven missions with full workspace autonomy.',
    images: ['/og-image.png'],
    creator: '@gpilot_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'mDIgeR6iYVwPHejVxBe9Nx-3Jr0XAO_W5R3jiXiFpOs',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'G-Pilot',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'Enterprise AI orchestration platform for autonomous agent workflows.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '12',
  },
};

import { SystemBanner } from '@/components/ui/system-banner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#0b57d0',
          colorBackground: '#0d1117',
          colorText: '#ffffff',
          colorInputBackground: '#161b22',
          colorInputText: '#ffffff',
        },
        elements: {
          card: 'bg-[#0d1117] border border-white/5 shadow-2xl rounded-3xl',
          navbar: 'bg-[#0d1117]',
          footer: 'bg-[#0d1117]',
          headerTitle: 'text-white font-black italic uppercase tracking-tighter',
          headerSubtitle: 'text-slate-500',
          socialButtonsBlockButton: 'bg-white/5 border-white/5 hover:bg-white/10 text-white',
          formButtonPrimary:
            'bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${inter.variable} ${outfit.variable} ${dmSerif.variable} font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SystemBanner />
            {children}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
