/**
 * Custom Service Worker for Push Notifications
 *
 * This file extends the next-pwa service worker with push handling.
 * It will be included via importScripts in the generated sw.js
 */

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'New notification from G-Pilot',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard',
        dateOfArrival: Date.now(),
        primaryKey: data.id || crypto.randomUUID(),
      },
      actions: data.actions || [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      tag: data.tag || 'g-pilot-notification',
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'G-Pilot', options)
    );
  } catch (error) {
    console.error('Failed to parse push data:', error);

    // Fallback to text content
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('G-Pilot', {
        body: text,
        icon: '/icons/icon-192x192.png',
      })
    );
  }
});

// Notification clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Open or focus the relevant page
  const urlToOpen = notificationData?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification closed without interaction
self.addEventListener('notificationclose', (event) => {
  // Track analytics if needed
  console.log('Notification closed:', event.notification.tag);
});

// Push subscription change (key rotation)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    fetch('/api/push/resubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldEndpoint: event.oldSubscription?.endpoint,
        newSubscription: event.newSubscription?.toJSON(),
      }),
    })
  );
});

console.log('[SW Push] Push notification handler loaded');
