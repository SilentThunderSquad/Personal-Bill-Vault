/**
 * Service Worker for handling push notifications
 * This handles notification clicks and background processing
 */

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  if (action === 'view' && data.url) {
    // Open the specific bill page
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Try to focus existing window
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(data.url) && 'focus' in client) {
              return client.focus();
            }
          }

          // Check if app is already open
          const appClient = clientList.find(client =>
            client.url.includes(self.registration.scope)
          );

          if (appClient && 'focus' in appClient) {
            // Navigate existing window
            appClient.focus();
            return appClient.postMessage({
              type: 'NAVIGATE',
              url: data.url
            });
          }

          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(data.url);
          }
        })
    );
  } else if (action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('Notification dismissed');
  } else {
    // Default click behavior - open app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Try to focus existing window
          if (clientList.length > 0) {
            return clientList[0].focus();
          }

          // Open new window
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
    );
  }

  // Send message to client about the click
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true })
      .then((clientList) => {
        clientList.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action,
            data
          });
        });
      })
  );
});

// Handle push events (for future server-sent push notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data.tag || 'warranty-alert',
      requireInteraction: data.requireInteraction || false,
      data: data.data,
      vibrate: [200, 100, 200],
      actions: data.data?.billId ? [
        {
          action: 'view',
          title: 'View Bill',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ] : undefined
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Background sync for warranty checks (experimental)
self.addEventListener('sync', (event) => {
  if (event.tag === 'warranty-check') {
    console.log('Background warranty check triggered');

    event.waitUntil(
      checkWarranties()
        .then(() => {
          console.log('Background warranty check completed');
        })
        .catch((error) => {
          console.error('Background warranty check failed:', error);
        })
    );
  }
});

// Function to check warranties in background
async function checkWarranties() {
  try {
    // This would typically call your API to check warranties
    // For now, we'll just log that the check happened
    console.log('Checking warranties in background...');

    // In a real implementation, you'd:
    // 1. Get user ID from IndexedDB or other storage
    // 2. Call your warranty check API
    // 3. Generate notifications if needed

    return Promise.resolve();
  } catch (error) {
    console.error('Error in background warranty check:', error);
    throw error;
  }
}

// Handle messages from main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CHECK_WARRANTIES':
      // Trigger a warranty check
      event.waitUntil(checkWarranties());
      break;
    default:
      break;
  }
});

console.log('Warranty notification service worker loaded');