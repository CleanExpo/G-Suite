'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Smartphone } from 'lucide-react';
import { useOrientation } from '@/hooks/use-orientation';

interface OrientationHandlerProps {
  /** Content to render */
  children: React.ReactNode;
  /** Preferred orientation for the app */
  preferredOrientation?: 'portrait' | 'landscape' | 'any';
  /** Whether to show a prompt when in wrong orientation */
  showOrientationPrompt?: boolean;
  /** Custom message for orientation prompt */
  promptMessage?: string;
}

/**
 * Orientation Handler Component
 *
 * Wraps content and provides orientation-aware behavior.
 * Can show a prompt when device is in non-preferred orientation.
 */
export function OrientationHandler({
  children,
  preferredOrientation = 'any',
  showOrientationPrompt = true,
  promptMessage,
}: OrientationHandlerProps) {
  const { orientation, isMobile, isTablet } = useOrientation();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show prompt on mobile/tablet devices
    if (!isMobile && !isTablet) {
      setShowPrompt(false);
      return;
    }

    // Check if orientation matches preference
    if (preferredOrientation === 'any') {
      setShowPrompt(false);
      return;
    }

    const wrongOrientation = orientation !== preferredOrientation;
    setShowPrompt(wrongOrientation && showOrientationPrompt);
  }, [orientation, preferredOrientation, showOrientationPrompt, isMobile, isTablet]);

  const defaultMessage = preferredOrientation === 'portrait'
    ? 'Please rotate your device to portrait mode'
    : 'Please rotate your device to landscape mode';

  return (
    <>
      {children}

      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-lg flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center space-y-8 max-w-sm"
            >
              {/* Animated device icon */}
              <motion.div
                animate={{
                  rotate: preferredOrientation === 'landscape' ? 90 : 0,
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="inline-block"
              >
                <div className="w-24 h-40 border-4 border-white rounded-3xl relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />
                  <Smartphone className="w-12 h-12 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </motion.div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Rotate Device
                  </span>
                </div>
                <p className="text-white text-lg font-medium">
                  {promptMessage || defaultMessage}
                </p>
                <p className="text-white/50 text-sm">
                  For the best experience
                </p>
              </div>

              <button
                onClick={() => setShowPrompt(false)}
                className="text-white/50 text-sm underline hover:text-white transition-colors"
              >
                Continue anyway
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Component that renders different content based on orientation
 */
export function OrientationSwitch({
  portrait,
  landscape,
}: {
  portrait: React.ReactNode;
  landscape: React.ReactNode;
}) {
  const { isPortrait } = useOrientation();
  return <>{isPortrait ? portrait : landscape}</>;
}
