'use client';

import { Bell, BellOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Notification Settings Component
 *
 * Allows users to enable/disable push notifications.
 * Shows current status and handles permission requests.
 */
export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
        <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center">
          <BellOff className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            Notifications Unavailable
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your browser doesn't support push notifications
          </p>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isSubscribed
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-gray-100 dark:bg-white/10'
          }`}>
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-blue-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              Push Notifications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isSubscribed
                ? 'Receive alerts for mission updates'
                : 'Enable to stay informed'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading || permission === 'denied'}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            isSubscribed
              ? 'bg-blue-600'
              : 'bg-gray-200 dark:bg-white/10'
          } ${
            isLoading || permission === 'denied'
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <motion.div
            animate={{
              x: isSubscribed ? 24 : 4,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
          >
            {isLoading && (
              <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
            )}
          </motion.div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {permission === 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </motion.div>
        )}

        {error && permission !== 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {isSubscribed && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              You'll receive notifications for mission completions and important updates.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
