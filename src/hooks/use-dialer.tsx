
'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useRef, useEffect } from 'react';
import type { Lead } from '@/lib/types';
import { getLiveCalls } from '@/lib/data';
import { getProfile } from '@/lib/auth';
import { useToast } from './use-toast';

type ActiveCall = {
  callId: string;
  leadName: string;
  startTime: number;
  leadId: string;
  onHangup?: () => void;
};

type CallStatus = 'idle' | 'connecting' | 'connected';

interface DialerContextType {
  isDialerOpen: boolean;
  openDialer: () => void;
  closeDialer: () => void;
  activeCall: ActiveCall | null;
  callStatus: CallStatus;
  startCall: (lead: Lead) => void;
  endCall: () => void;
}

const DialerContext = createContext<DialerContextType | undefined>(undefined);

export function DialerProvider({ children }: { children: ReactNode }) {
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const startPollingForCall = useCallback((lead: Lead) => {
    const agentProfile = getProfile();
    if (!agentProfile?.phone) {
        toast({ variant: 'destructive', title: 'Polling Error', description: 'Agent phone number not found.' });
        setCallStatus('idle');
        return;
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const liveCalls = await getLiveCalls(agentProfile.phone);
        const matchedCall = liveCalls.find(call => call.customer_number === lead.phone);

        if (matchedCall && matchedCall.call_id) {
          stopPolling();
          setActiveCall({
            callId: matchedCall.call_id,
            leadId: lead.id,
            leadName: lead.name,
            startTime: new Date(matchedCall.start_stamp).getTime(),
            onHangup: () => {
                // This will be called from the endCall function
                // The idea is to pass a potential refresh function from the component that starts the call
                const event = new CustomEvent('leadDataShouldRefresh', { detail: { leadId: lead.id }});
                window.dispatchEvent(event);
            }
          });
          setCallStatus('connected');
        }
      } catch (error: any) {
        console.error("Polling for live calls failed:", error);
        toast({ variant: 'destructive', title: 'Polling Error', description: error.message });
        stopPolling();
        setCallStatus('idle');
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 30 seconds to prevent infinite loops
    setTimeout(() => {
        if (pollingIntervalRef.current) {
            stopPolling();
            setCallStatus('idle');
            toast({ variant: 'destructive', title: 'Call Failed', description: 'Could not connect the call. Please try again.' });
        }
    }, 30000);
  }, [stopPolling, toast]);


  const startCall = useCallback((lead: Lead) => {
    setCallStatus('connecting');
    // The `initiateCall` function is still called, but we don't use its response for the call_id anymore
    // The actual polling is now handled by the component that calls `startCall`
    startPollingForCall(lead);
  }, [startPollingForCall]);

  const endCall = useCallback(() => {
    if (activeCall && activeCall.onHangup) {
      // Wait 5 seconds before triggering the refetch to allow for webhook processing
      setTimeout(() => {
        activeCall.onHangup!();
      }, 5000);
    }
    setActiveCall(null);
    setCallStatus('idle');
    stopPolling();
  }, [activeCall, stopPolling]);

  useEffect(() => {
      return () => {
          stopPolling(); // Cleanup on unmount
      }
  }, [stopPolling]);

  return (
    <DialerContext.Provider value={{ isDialerOpen, openDialer, closeDialer, activeCall, callStatus, startCall, endCall }}>
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
