'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { logout } from '@/lib/auth';
import { AlertTriangle } from 'lucide-react';
import { sessionEmitter } from '@/lib/session-emitter';

/**
 * A client component that listens for session expiration events and displays a modal.
 */
export function SessionManager() {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setIsExpired(true);
    };

    // Subscribe to the global session expired event.
    sessionEmitter.on('expired', handleExpired);

    // Clean up the subscription on unmount.
    return () => {
      sessionEmitter.off('expired', handleExpired);
    };
  }, []);

  const handleRedirect = () => {
    setIsExpired(false);
    logout();
  };

  // The component renders nothing unless the session is expired.
  if (!isExpired) {
    return null;
  }

  return (
    <AlertDialog open={isExpired}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Session Expired
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your session has expired. Please log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleRedirect}>
            Go to Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
