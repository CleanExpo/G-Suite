'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ThemeToggle } from './theme-toggle';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Cpu, Target, Zap, Shield, Sparkles } from 'lucide-react';

export function Navbar() {
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 50], [120, 80]);
  const backgroundSize = useTransform(scrollY, [0, 50], ['100%', '95%']);
  const borderRadius = useTransform(scrollY, [0, 50], [0, 32]);
  const marginTop = useTransform(scrollY, [0, 50], [0, 16]);
  const borderOpacity = useTransform(scrollY, [0, 50], [0.1, 0.2]);

  return (
    <motion.nav
      style={{
        height,
        width: backgroundSize,
        borderRadius,
        marginTop,
        left: '50%',
        translateX: '-50%',
      }}
      className="fixed top-0 z-50 bg-white/70 dark:bg-[#0b0e14]/80 backdrop-blur-3xl border-b border-gray-200 dark:border-white/10 transition-colors shadow-2xl shadow-black/5"
    >
      <div className="max-w-[1600px] mx-auto h-full px-12 flex items-center justify-between">
        {/* Branding Block */}
        <Link href="/" className="flex items-center gap-6 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="relative w-20 h-20 overflow-hidden rounded-3xl border-2 border-blue-600/20 group-hover:border-blue-600 transition-colors shadow-2xl"
          >
            <Image src="/logo-light.png" alt="G-Pilot" fill className="object-cover dark:hidden" />
            <Image
              src="/logo-dark.png"
              alt="G-Pilot"
              fill
              className="object-cover hidden dark:block"
            />
            <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-3xl lg:text-4xl text-gray-900 dark:text-white tracking-tighter leading-none uppercase italic flex items-center gap-3">
              G-PILOT
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
              />
            </span>
            <span className="text-xs uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 font-black mt-1">
              Algorithm Dominance Node
            </span>
          </div>
        </Link>

        {/* Tactical Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {[
            { label: 'Platform', href: '/platform' },
            { label: 'Solutions', href: '/solutions' },
            { label: 'Growth', href: '/solutions/marketing', highlight: true },
            { label: 'Abilities', href: '/abilities' },
            { label: 'Pricing', href: '/pricing' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`relative text-xs font-black uppercase tracking-widest transition-all hover:text-blue-600 group ${link.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {link.label}
              {link.highlight && (
                <motion.span
                  layoutId="highlight-dot"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Operations Hub */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:border-blue-600/30">
            <Shield className="w-3 h-3 text-blue-600" /> AES-256{' '}
            <ChevronRight className="w-4 h-4 opacity-50" />
          </div>

          <ThemeToggle />

          <SignedOut>
            <SignInButton mode="modal">
              <button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                Ignite <Zap className="w-4 h-4 fill-current" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard/schedule"
                className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors"
              >
                Schedule
              </Link>
              <Link
                href="/dashboard"
                className="h-14 px-8 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                Dashboard <Cpu className="w-4 h-4" />
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      'w-12 h-12 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm',
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>

      {/* Ambient Progress Strip */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        style={{ width: '200%' }}
      />
    </motion.nav>
  );
}
