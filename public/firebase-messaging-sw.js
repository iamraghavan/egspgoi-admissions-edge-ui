// public/firebase-messaging-sw.js

// Use a more recent version of the Firebase SDK
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This config should match your main app's config
const firebaseConfig = {
    "projectId": "studio-4460931313-2c74b",
    "appId": "1:866648181583:web:81ee780f03f8ef0498533a",
    "apiKey": "AIzaSyDVYkjdG-Baa8gUZvxsFjjsPkNMXGS0xdo",
    "authDomain": "studio-4460931313-2c74b.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "866648181583"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handler for background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    data: payload.data || { url: '/' } // Pass along data for click handling
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handler for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // This is the URL that will be opened when the notification is clicked
  const urlToOpen = event.notification.data?.url || '/';

  // This looks for an open window with the same URL and focuses it.
  // If no window is found, it opens a new one.
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        // You might need to adjust the URL comparison logic
        if (new URL(client.url).pathname === new URL(urlToOpen, self.location.origin).pathname && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
