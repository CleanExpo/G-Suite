'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  saveSubscription,
  removeSubscription,
} from '@/lib/push-notifications';

export interface UsePushNotificationsReturn {
  /** Whether push notifications are supported in this browser */
  isSupported: boolean;
  /** Current permission status */
  permission: NotificationPermission | 'unsupported';
  /** Whether currently subscribed to push notifications */
  isSubscribed: boolean;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
  /** Request permission and subscribe to push notifications */
  subscribe: () => Promise<boolean>;
  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<boolean>;
}

/**
 * Hook for managing push notification subscriptions
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check initial state
  useEffect(() => {
    const checkStatus = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (!supported) {
        setIsLoading(false);
        return;
      }

      const perm = getNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        const subscribed = await isSubscribedToPush();
        setIsSubscribed(subscribed);
      }

      setIsLoading(false);
    };

    checkStatus();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestNotificationPermission();
        setPermission(newPermission);

        if (newPermission !== 'granted') {
          setError('Notification permission denied');
          setIsLoading(false);
          return false;
        }
      }

      // Subscribe to push
      const subscription = await subscribeToPush();
      if (!subscription) {
        setError('Failed to create push subscription');
        setIsLoading(false);
        return false;
      }

      // Save subscription to server
      const saved = await saveSubscription(subscription);
      if (!saved) {
        setError('Failed to save subscription to server');
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, [permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from push
      const unsubscribed = await unsubscribeFromPush();
      if (!unsubscribed) {
        setError('Failed to unsubscribe from push');
        setIsLoading(false);
        return false;
      }

      // Remove subscription from server
      await removeSubscription();

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
