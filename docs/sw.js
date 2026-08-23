// CareBridge Service Worker - Background Medicine Alarms & System Push Notifications
const CACHE_NAME = 'carebridge-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for schedule messages from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    const payload = event.data.payload || {};
    self.registration.showNotification(payload.title || "💊 CareBridge Medicine Reminder", {
      body: payload.body || "Time to take your scheduled medication dose.",
      icon: payload.icon || "/static/carebridge_bg.jpg",
      badge: payload.badge || "/static/carebridge_bg.jpg",
      tag: payload.tag || "dose-alarm",
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 500],
      data: payload.data || {},
      actions: [
        { action: 'take', title: '✓ Mark Taken' },
        { action: 'snooze', title: '⏰ Snooze 10m' }
      ]
    });
  }
});

// Notification click handling: Open app, focus window, mark medication
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const doseId = event.notification.data?.doseId;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('127.0.0.1') || client.url.includes('localhost') || client.url.includes('http')) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_ACTION',
            action: action,
            doseId: doseId
          });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/?dose=' + (doseId || '') + '&action=' + (action || 'view'));
      }
    })
  );
});

// Receive background push notifications if Web Push server triggers
self.addEventListener('push', (event) => {
  let payload = {
    title: "💊 CareBridge Medicine Reminder",
    body: "It's time to take your scheduled dose!",
    icon: "/static/carebridge_bg.jpg",
    badge: "/static/carebridge_bg.jpg",
    tag: "med-reminder",
    requireInteraction: true,
    actions: [
      { action: 'take', title: '✓ Mark Taken' },
      { action: 'snooze', title: '⏰ Snooze 10m' }
    ]
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/static/carebridge_bg.jpg',
      badge: payload.badge || '/static/carebridge_bg.jpg',
      tag: payload.tag || 'med-reminder',
      requireInteraction: true,
      vibrate: [300, 150, 300, 150, 500],
      data: payload.data || {},
      actions: [
        { action: 'take', title: '✓ Mark Taken' },
        { action: 'snooze', title: '⏰ Snooze 10m' }
      ]
    })
  );
});
