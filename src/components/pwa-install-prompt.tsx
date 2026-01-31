'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed before (stored in localStorage)
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedAt = dismissed ? parseInt(dismissed, 10) : 0;
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);

      // Show prompt if never dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        // Delay showing prompt to not interrupt initial page load
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show prompt if conditions not met
  if (!showPrompt && !isIOS) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50"
        >
          <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  {isIOS ? (
                    <Share className="w-5 h-5 text-white" />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    Install G-Pilot
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get the full app experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Benefits */}
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Launch from dock</span>
                </div>
              </div>

              {isIOS ? (
                /* iOS Instructions */
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    To install on iOS:
                  </p>
                  <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                    <li>Tap the <Share className="inline w-4 h-4 mx-1" /> Share button</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              ) : (
                /* Install Button for Android/Desktop */
                <button
                  onClick={handleInstall}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
