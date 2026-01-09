
'use client';

import { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type ActiveCall = {
  callId: string;
  leadName: string;
  startTime: number;
  leadId: string;
  onHangup?: () => void;
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
    if (activeCall && activeCall.onHangup) {
      // Wait 5 seconds before triggering the refetch to allow for webhook processing
      setTimeout(() => {
        activeCall.onHangup!();
      }, 5000);
    }
    setActiveCall(null);
  }, [activeCall]);

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
