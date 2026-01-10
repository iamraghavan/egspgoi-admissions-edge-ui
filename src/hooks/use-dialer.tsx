

'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useRef, useEffect } from 'react';
import type { Lead } from '@/lib/types';
import { initiateCall, pollForActiveCall } from '@/lib/data';
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

  const openDialer = useCallback(() => setIsDialerOpen(true), []);
  const closeDialer = useCallback(() => setIsDialerOpen(false), []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const startPollingForCall = useCallback(async (lead: Lead, pollUrl: string) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const pollResponse = await pollForActiveCall(pollUrl);

        if (pollResponse?.active && pollResponse.call_id) {
          stopPolling();
          setActiveCall({
            callId: pollResponse.call_id,
            leadId: lead.id,
            leadName: lead.name,
            startTime: Date.now(), // Start time is when frontend confirms connection
            onHangup: () => {
                const event = new CustomEvent('leadDataShouldRefresh', { detail: { leadId: lead.id }});
                window.dispatchEvent(event);
            }
          });
          setCallStatus('connected');
        }
        // If not active, the interval continues polling
      } catch (error: any) {
        console.error("Polling for active call failed:", error);
        toast({ variant: 'destructive', title: 'Polling Error', description: error.message });
        stopPolling();
        setCallStatus('idle');
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 30 seconds to prevent infinite loops
    setTimeout(() => {
        if (pollingIntervalRef.current) {
            stopPolling();
            if (callStatus !== 'connected') {
                setCallStatus('idle');
                toast({ variant: 'destructive', title: 'Call Failed', description: 'Could not connect the call. Please try again.' });
            }
        }
    }, 30000);
  }, [stopPolling, toast, callStatus]);


  const startCall = useCallback(async (lead: Lead) => {
    setCallStatus('connecting');
    try {
        const initiationResponse = await initiateCall(lead.id);
        if (initiationResponse && initiationResponse.poll_url) {
            startPollingForCall(lead, initiationResponse.poll_url);
        } else {
            throw new Error("Did not receive a poll URL to track the call.");
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Call Initiation Failed",
            description: error.message,
        });
        setCallStatus('idle');
    }
  }, [startPollingForCall, toast]);

  const endCall = useCallback(() => {
    if (activeCall && activeCall.onHangup) {
      // Wait a few seconds before triggering the refetch to allow for webhook processing
      setTimeout(() => {
        activeCall.onHangup!();
      }, 3000);
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

    