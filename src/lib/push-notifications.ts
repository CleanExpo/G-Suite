/**
 * Web Push Notification Utilities
 *
 * Handles subscription management and permission requests
 * for Web Push API notifications.
 */

// VAPID public key - generate with: npx web-push generate-vapid-keys
// Store private key in VAPID_PRIVATE_KEY env variable
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }
  return await Notification.requestPermission();
}

/**
 * Convert VAPID key to Uint8Array for subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const subscriptionJson = subscription.toJSON();

    return {
      endpoint: subscriptionJson.endpoint!,
      keys: {
        p256dh: subscriptionJson.keys!.p256dh!,
        auth: subscriptionJson.keys!.auth!,
      },
    };
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

/**
 * Check if currently subscribed to push
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    return false;
  }
}

/**
 * Send subscription to server for storage
 */
export async function saveSubscription(subscription: PushSubscriptionData): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to save subscription:', error);
    return false;
  }
}

/**
 * Remove subscription from server
 */
export async function removeSubscription(): Promise<boolean> {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to remove subscription:', error);
    return false;
  }
}
