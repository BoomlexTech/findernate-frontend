// Firebase Messaging Service Worker
// This file handles background FCM notifications

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: You need to replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBS2VB9h0FHBhs93ucROiy9nzAcgdiA7Bo",
  authDomain: "findernate-900de.firebaseapp.com",
  projectId: "findernate-900de",
  storageBucket: "findernate-900de.firebasestorage.app",
  messagingSenderId: "902240921355",
  appId: "1:902240921355:web:b11f85d182914bb20ce40e"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background Message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || payload.data?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'notification',
    requireInteraction: payload.data?.type === 'incoming_call',
    vibrate: payload.data?.type === 'incoming_call' ? [200, 100, 200, 100, 200] : undefined
  };

  // Add actions based on notification type
  if (payload.data?.type === 'incoming_call') {
    notificationOptions.actions = [
      { action: 'accept_call', title: 'Accept' },
      { action: 'decline_call', title: 'Decline' }
    ];
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'accept_call') {
    // Open app and send message to accept call
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Send message to app to accept call
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'ACCEPT_CALL',
              data: data
            });
            return client.focus();
          }
        }

        // If no window open, open new one
        if (clients.openWindow) {
          return clients.openWindow(`/?action=accept_call&callId=${data.callId}`);
        }
      })
    );
  } else if (action === 'decline_call') {
    // Send message to decline call
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'DECLINE_CALL',
              data: data
            });
            return;
          }
        }

        // If no window open, just make API call to decline
        // This would need to be implemented
      })
    );
  } else {
    // Default action - open the app
    const urlToOpen = data.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data
            });
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
