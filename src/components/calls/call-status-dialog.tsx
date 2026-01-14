
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, PhoneOff, AlertCircle, User, Clock } from 'lucide-react';
import { initiateCall, hangupCall } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getProfile } from '@/lib/auth';
import { useDatabase } from '@/firebase';
import { ref, onValue, off } from 'firebase/database';

type CallState = 'idle' | 'initiating' | 'ringing' | 'connected' | 'failed' | 'hangedup' | 'not_found';

interface ActiveCallDetails {
    call_id: string;
    status: string;
    duration: string;
    agent_name: string;
    customer_number: string;
    unique_id: string;
}

interface CallStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lead: Lead | null;
}

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

const CallDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-center text-sm">
        <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
        <span className="font-medium text-muted-foreground mr-2">{label}:</span>
        <span className="text-foreground">{value}</span>
    </div>
);

export function CallStatusDialog({ isOpen, onOpenChange, lead }: CallStatusDialogProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [activeCall, setActiveCall] = useState<ActiveCallDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [agentName, setAgentName] = useState('');
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callInitiationId = useRef<string | null>(null);
  const { toast } = useToast();
  const database = useDatabase();

   useEffect(() => {
    async function fetchAgentName() {
        const profile = await getProfile();
        if (profile?.name) {
            setAgentName(profile.name);
        }
    }
    fetchAgentName();
   }, []);

  const cleanup = useCallback(() => {
    console.log("Cleaning up call dialog resources.");
    if (lead?.id && database) {
        const callRef = ref(database, `smartflo_calls/${lead.id}`);
        off(callRef);
        console.log("Unsubscribed from Firebase listener for ref_id:", lead.id);
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setCallState('idle');
    setActiveCall(null);
    setErrorMessage(null);
    setDuration(0);
    callInitiationId.current = null;
  }, [database, lead]);


  const startCallProcess = async () => {
    if (!lead) return;
    setCallState('initiating');
    console.log('Starting call process...');
    try {
      const initiationResponse = await initiateCall(lead.id);
      
      const uniqueId = initiationResponse?.ref_id;
      if (uniqueId) {
        callInitiationId.current = uniqueId;
        console.log("Call initiated successfully, ref_id:", callInitiationId.current);
        setCallState('ringing');
      } else {
        throw new Error('Did not receive a ref_id to track the call.');
      }
    } catch (error: any) {
      console.error("Error in startCallProcess:", error.message);
      setErrorMessage(error.message || 'Failed to initiate call.');
      setCallState('failed');
    }
  };

  // Dedicated effect for Firebase subscription
  useEffect(() => {
    // We only want to run this effect when the dialog is open and we have a lead.
    if (!isOpen || !lead?.id || !database) {
        return;
    }

    const refId = lead.id;
    console.log(`Listening for updates on: smartflo_calls/${refId}`);
    const callRef = ref(database, `smartflo_calls/${refId}`);
    
    const notFoundTimeout = setTimeout(() => {
        if(callState === 'ringing') {
            console.warn(`No data found at smartflo_calls/${refId} after 10 seconds.`);
            setErrorMessage("Could not connect to the call. The tracking session may not have started correctly on the server.");
            setCallState('not_found');
        }
    }, 10000);

    const unsubscribe = onValue(callRef, (snapshot) => {
        clearTimeout(notFoundTimeout);
        if (snapshot.exists()) {
            const callEvent = snapshot.val();
            console.log("🔥 Received Call Update from Firebase:", callEvent);

            setActiveCall(prev => ({
                ...(prev || {}),
                ...callEvent,
                customer_number: callEvent.customer_number || lead?.phone || '',
                agent_name: callEvent.agent_name || agentName,
                unique_id: refId,
            }));

            const newStatus = callEvent.status?.toLowerCase();
            
            if (newStatus === 'answered') {
                if (callState !== 'connected') {
                    setCallState('connected');
                    startDurationTimer();
                }
            } else if (newStatus === 'hangup' || newStatus === 'missed') {
                 toast({ title: "Call Ended", description: "The call was terminated." });
                 onOpenChange(false);
            } else if (newStatus) {
                setCallState(newStatus);
            }
        }
    }, (error) => {
        console.error("Firebase subscription error:", error);
        setErrorMessage('Connection to real-time call updates failed.');
        setCallState('failed');
    });

    // Cleanup function for this effect
    return () => {
        console.log("Unsubscribing from Firebase path:", refId);
        clearTimeout(notFoundTimeout);
        off(callRef);
    };

  }, [isOpen, lead, database, agentName, onOpenChange, toast, callState]);

  // Main effect to handle dialog open/close
  useEffect(() => {
    if (isOpen && lead) {
      startCallProcess();
    }

    // The cleanup function for the main effect will handle full resource cleanup.
    return () => {
        if (!isOpen) { // Only cleanup when dialog is truly closing
            cleanup();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lead]);
  
  const startDurationTimer = () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
      }, 1000);
  };

  const handleHangup = async () => {
    if (!activeCall?.call_id) return;
    setCallState('hangedup');
    try {
      await hangupCall(activeCall.call_id);
      toast({ title: 'Hangup Initiated' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hangup Failed', description: error.message });
      // Revert state if hangup fails to allow retry
      if (activeCall?.status) setCallState(activeCall.status.toLowerCase() as CallState);
    }
  };

  const getStatusVariant = (status: string | undefined) => {
      switch(status?.toLowerCase()){
          case 'answered':
          case 'connected':
              return 'success';
          case 'ringing':
              return 'warning';
          default:
              return 'default';
      }
  }

  const renderContent = () => {
    switch (callState) {
      case 'initiating':
      case 'ringing':
        return (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to {lead?.name}...</p>
            <p className="text-sm text-muted-foreground capitalize">{callState}...</p>
          </div>
        );
      case 'connected':
        return (
           <div className="flex flex-col items-center justify-center h-56 gap-4">
            <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16'>
                    <AvatarFallback className='text-2xl'>{lead?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='text-left'>
                    <p className="text-sm text-muted-foreground">In call with</p>
                    <p className="text-2xl font-bold text-primary">{lead?.name}</p>
                </div>
            </div>
            
            <div className='flex items-center gap-2 my-4'>
                <Badge variant={getStatusVariant(activeCall?.status)} className="capitalize text-sm">
                    {activeCall?.status}
                </Badge>
                <p className="font-mono text-2xl font-semibold">{formatDuration(duration)}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-sm">
                <CallDetailItem icon={User} label="Agent" value={activeCall?.agent_name || '...'} />
                <CallDetailItem icon={Phone} label="Number" value={activeCall?.customer_number || '...'} />
            </div>
          </div>
        );
      case 'failed':
      case 'not_found':
         return (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Call Failed</p>
            <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
          </div>
        );
      default:
        return (
             <div className="flex flex-col items-center justify-center h-56 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 <p className="text-lg font-medium">Please wait...</p>
                <p className="text-sm text-muted-foreground capitalize">{callState}...</p>
             </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Call Status</DialogTitle>
          <DialogDescription>
            {callState === 'connected' ? `Connected via Smartflo` : `Attempting to call ${lead?.phone}`}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter className="mt-4">
            {callState === 'failed' || callState === 'not_found' ? (
                <Button onClick={() => onOpenChange(false)} className="w-full">Close</Button>
            ) : (
                <Button onClick={handleHangup} disabled={!activeCall?.call_id || callState === 'hangedup'} variant="destructive" className="w-full">
                {callState === 'hangedup' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PhoneOff className="mr-2 h-5 w-5" />}
                Hang Up
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
