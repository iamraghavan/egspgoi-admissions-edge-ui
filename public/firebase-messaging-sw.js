// This file must be in the public folder.

// Scripts for service worker
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
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

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon1.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
