
'use client';

import { getMessaging, getToken } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase';
import { saveDeviceToken } from '@/lib/data';

// This function should be called once, probably when the app initializes or user logs in.
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const { messaging } = initializeFirebase();

      // =================================================================================
      // IMPORTANT: ACTION REQUIRED
      // =================================================================================
      // To enable web push notifications, you MUST generate a VAPID key in your
      // Firebase project's settings and paste it here.
      //
      // Follow these steps:
      // 1. Go to your Firebase project: https://console.firebase.google.com/
      // 2. Click the gear icon > Project settings.
      // 3. Go to the "Cloud Messaging" tab.
      // 4. Under "Web configuration", find "Web Push certificates" and click "Generate key pair".
      // 5. Copy the generated key and replace the placeholder below.
      //
      // Push notifications will NOT work until this key is set correctly.
      // =================================================================================
      const vapidKey = "YOUR_PUBLIC_VAPID_KEY_FROM_FIREBASE_CONSOLE";
      
      if (vapidKey === "YOUR_PUBLIC_VAPID_KEY_FROM_FIREBASE_CONSOLE") {
        console.warn("VAPID key not set. Push notifications will not work. Please update src/lib/notifications.ts");
        return;
      }

      const fcmToken = await getToken(messaging, { vapidKey });

      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // Silently save the token to the backend
        await saveDeviceToken(fcmToken);
        console.log('FCM token registration attempt finished.');
      } else {
        console.log('Could not get FCM token. This may be because the VAPID key is incorrect.');
      }
    } else {
        console.log('Notification permission was not granted.');
    }
  } catch (error) {
    console.error('An error occurred while setting up notifications: ', error);
  }
};
