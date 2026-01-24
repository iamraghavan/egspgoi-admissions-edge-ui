'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // Initialize Firebase on the client side, once per component mount.
    setFirebaseServices(initializeFirebase());
  }, []); // Empty dependency array ensures this runs only once on mount

  // Do not render children until Firebase has been initialized on the client.
  if (!firebaseServices) {
    // You can render a loading indicator here if you want.
    // Returning null is sufficient to prevent the rest of the app from rendering
    // before Firebase is ready.
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      database={firebaseServices.database}
      messaging={firebaseServices.messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
