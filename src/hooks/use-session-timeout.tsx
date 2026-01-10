
'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface SessionTimeoutContextType {
  isTimeoutDialogOpen: boolean;
  openTimeoutDialog: () => void;
  closeTimeoutDialog: () => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export function SessionTimeoutProvider({ children }: { children: ReactNode }) {
  const [isTimeoutDialogOpen, setIsTimeoutDialogOpen] = useState(false);

  const openTimeoutDialog = useCallback(() => {
    setIsTimeoutDialogOpen(true);
  }, []);

  const closeTimeoutDialog = useCallback(() => {
    setIsTimeoutDialogOpen(false);
  }, []);

  return (
    <SessionTimeoutContext.Provider value={{ isTimeoutDialogOpen, openTimeoutDialog, closeTimeoutDialog }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeout() {
  const context = useContext(SessionTimeoutContext);
  if (context === undefined) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider');
  }
  return context;
}
