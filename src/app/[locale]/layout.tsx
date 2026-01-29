import type { Metadata } from 'next';
import { Inter, Outfit, DM_Serif_Display } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Footer } from '@/components/footer';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setUserLocale } from '@/lib/locale';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  style: 'italic',
});

const appUrl = 'https://g-pilot.app';

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

// Development mode banner component
function DevModeBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-center py-2 px-4 text-sm font-bold shadow-lg">
      ⚠️ DEV MODE - Authentication Bypassed | <span className="font-mono">Set SUPABASE keys in .env to enable auth</span>
    </div>
  );
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Update locale cookie for consistency if needed
  await setUserLocale(locale);

  const messages = await getMessages();
  const showDevBanner = !isSupabaseConfigured;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${dmSerif.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {showDevBanner && <DevModeBanner />}
            <NextIntlClientProvider messages={messages} locale={locale}>
              <div className={showDevBanner ? 'pt-10' : ''}>
                <SystemBanner />
                {children}
                <Footer />
              </div>
            </NextIntlClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
