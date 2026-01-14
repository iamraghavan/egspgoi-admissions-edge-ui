
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
import { amplifyClient } from '@/lib/amplify-client';

type CallState = 'idle' | 'initiating' | 'ringing' | 'connected' | 'failed' | 'hangedup';

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

const SUBSCRIBE_TO_CALLS = `
  subscription OnCallUpdate($ref_id: ID!) {
    onCallUpdate(ref_id: $ref_id) {
      ref_id
      call_id
      status
    }
  }
`;

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
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const callInitiationId = useRef<string | null>(null);
  const { toast } = useToast();

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
    if (subscriptionRef.current) {
      console.log("Unsubscribing from GraphQL subscription.");
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
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
  }, []);

  useEffect(() => {
    if (isOpen && lead) {
      startCallProcess();
    } else {
      cleanup();
    }
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lead]);


  const startCallProcess = async () => {
    if (!lead) return;
    console.log("Starting call process...");
    setCallState('initiating');
    try {
      const initiationResponse = await initiateCall(lead.id);
      if (initiationResponse && initiationResponse.unique_id) {
        console.log("Call initiated successfully, unique_id:", initiationResponse.unique_id);
        callInitiationId.current = initiationResponse.unique_id;
        startSubscription(initiationResponse.unique_id);
      } else {
        throw new Error('Did not receive a unique_id to track the call.');
      }
    } catch (error: any) {
      console.error("Error in startCallProcess:", error.message);
      setErrorMessage(error.message || 'Failed to initiate call.');
      setCallState('failed');
    }
  };

  const startSubscription = (uniqueId: string) => {
    setCallState('ringing');
    console.log(`Starting GraphQL subscription for unique_id: ${uniqueId}`);
    try {
        const sub = amplifyClient.graphql({ 
            query: SUBSCRIBE_TO_CALLS,
            variables: { ref_id: uniqueId }
        }).subscribe({
            next: ({ data }) => {
                console.log("Received raw data from AppSync:", data);
                if (!data || !data.onCallUpdate) {
                    console.warn("Received incomplete data from subscription:", data);
                    return;
                }
                const callEvent = data.onCallUpdate;

                console.log("Received Call Update from AppSync:", callEvent);
                
                if (callEvent.ref_id !== callInitiationId.current) {
                    console.warn(`Received event for different unique_id. Current: ${callInitiationId.current}, Received: ${callEvent.ref_id}. Ignoring.`);
                    return;
                }

                setActiveCall(prev => ({
                    ...(prev || {duration: '0', customer_number: lead?.phone || '', unique_id: callEvent.ref_id}),
                    status: callEvent.status || 'ringing',
                    agent_name: prev?.agent_name || agentName,
                    call_id: callEvent.call_id || prev?.call_id,
                }));

                if (callEvent.status?.toLowerCase() === 'answered' && callState !== 'connected') {
                    setCallState('connected');
                    startDurationTimer();
                }
                 if (callEvent.status?.toLowerCase() === 'hangup') {
                    toast({ title: "Call Ended", description: "The call was terminated." });
                    onOpenChange(false);
                }
            },
            error: (err) => {
                console.error("Subscription Error:", err);
                setErrorMessage('Connection to real-time call updates failed.');
                setCallState('failed');
            }
        });
        subscriptionRef.current = sub;
        console.log("Successfully subscribed to AppSync.");

    } catch (error) {
        console.error("Failed to start subscription:", error);
        setErrorMessage('Could not connect to the real-time call service.');
        setCallState('failed');
    }
  };
  
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
      setCallState('connected');
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
            {callState === 'failed' ? (
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

    