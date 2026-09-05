// sw.js – Service Worker for Web Push Notifications
// Runs in the background, receives push payloads from the server
// and displays native browser notifications.

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'GlobXplore Notification';
  const options = {
    body: data.body || data.message || '',
    icon: data.icon || '/favicon.jpg',
    badge: '/favicon.jpg',
    data: { url: data.url || '/' },
    tag: data.tag || 'globxplore-notification',
    renotify: !!data.tag, // re-notify only when a specific tag is set
    vibrate: [100, 50, 100],
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url;
  if (url) {
    // Focus existing window or open a new one
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Activate immediately when updated
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});
