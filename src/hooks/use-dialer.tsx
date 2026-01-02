
'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

interface DialerContextType {
  isDialerOpen: boolean;
  openDialer: () => void;
  closeDialer: () => void;
}

const DialerContext = createContext<DialerContextType | undefined>(undefined);

export function DialerProvider({ children }: { children: ReactNode }) {
  const [isDialerOpen, setIsDialerOpen] = useState(false);

  const openDialer = () => setIsDialerOpen(true);
  const closeDialer = () => setIsDialerOpen(false);

  return (
    <DialerContext.Provider value={{ isDialerOpen, openDialer, closeDialer }}>
      {children}
    </DialerContext.Provider>
  );
}

export function useDialer() {
  const context = useContext(DialerContext);
  if (context === undefined) {
    throw new Error('useDialer must be used within a DialerProvider');
  }
  return context;
}
