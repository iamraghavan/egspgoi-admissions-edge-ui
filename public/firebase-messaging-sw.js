// Using firebase v10.12.2 to stay modern and compatible
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// This config MUST match the one in your main app.
const firebaseConfig = {
  apiKey: "AIzaSyDVYkjdG-Baa8gUZvxsFjjsPkNMXGS0xdo",
  authDomain: "studio-4460931313-2c74b.firebaseapp.com",
  projectId: "studio-4460931313-2c74b",
  storageBucket: "studio-4460931313-2c74b.appspot.com",
  messagingSenderId: "866648181583",
  appId: "1:866648181583:web:81ee780f03f8ef0498533a"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/apple-icon.png', // Use an existing icon from the project
    data: payload.data // This allows us to pass a URL to open on click
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the correct URL or focus the window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window open with the target URL
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
