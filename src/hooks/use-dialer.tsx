
'use client';

import { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type ActiveCall = {
  callId: string;
  leadName: string;
  startTime: number;
};

interface DialerContextType {
  isDialerOpen: boolean;
  openDialer: () => void;
  closeDialer: () => void;
  activeCall: ActiveCall | null;
  startCall: (call: ActiveCall) => void;
  endCall: () => void;
}

const DialerContext = createContext<DialerContextType | undefined>(undefined);

export function DialerProvider({ children }: { children: ReactNode }) {
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const openDialer = () => setIsDialerOpen(true);
  const closeDialer = () => setIsDialerOpen(false);

  const startCall = useCallback((call: ActiveCall) => {
    setActiveCall(call);
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return (
    <DialerContext.Provider value={{ isDialerOpen, openDialer, closeDialer, activeCall, startCall, endCall }}>
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
