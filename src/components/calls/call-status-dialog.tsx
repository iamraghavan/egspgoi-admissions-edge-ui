
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
import { Loader2, Phone, PhoneOff, AlertCircle, User, Clock, RadioTower } from 'lucide-react';
import { initiateCall, pollForActiveCall, hangupCall } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/lib/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getProfile } from '@/lib/auth';

type CallState = 'idle' | 'initiating' | 'polling' | 'connected' | 'failed' | 'hangedup';

interface ActiveCallDetails {
    call_id: string;
    status: string;
    duration: string;
    agent_name: string;
    customer_number: string;
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
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    pollingIntervalRef.current = null;
    durationIntervalRef.current = null;
    setCallState('idle');
    setActiveCall(null);
    setErrorMessage(null);
    setDuration(0);
  }, []);

  useEffect(() => {
    if (isOpen && lead) {
      startCallProcess();
    } else {
      cleanup();
    }
    return () => {
        cleanup();
    };
  }, [isOpen, lead, cleanup]);


  const startCallProcess = async () => {
    if (!lead) return;

    setCallState('initiating');
    try {
      const initiationResponse = await initiateCall(lead.id);
      if (initiationResponse && initiationResponse.poll_url) {
        startPolling(initiationResponse.poll_url);
      } else {
        throw new Error('Did not receive a poll URL to track the call.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to initiate call.');
      setCallState('failed');
    }
  };

  const startPolling = (pollUrl: string) => {
    setCallState('polling');
    
    const pollingTimeout = setTimeout(() => {
      if (pollingIntervalRef.current) {
        cleanup();
        setCallState('failed');
        setErrorMessage('Call did not connect in time. Please try again.');
      }
    }, 30000); // Stop polling after 30 seconds if not connected

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const pollResponse = await pollForActiveCall(pollUrl);
        if (pollResponse?.active && pollResponse.call_id) {
          clearTimeout(pollingTimeout);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          
          setActiveCall({
              ...pollResponse,
              agent_name: pollResponse.agent_name || agentName,
          });
          setCallState('connected');
          startDurationTimer();
        } else if (pollResponse) {
             setActiveCall(prev => ({
                ...(prev || {call_id: '', duration: '0', customer_number: lead?.phone || ''}),
                status: pollResponse.status || 'Ringing',
                agent_name: pollResponse.agent_name || agentName,
            }));
        }
      } catch (error: any) {
        clearTimeout(pollingTimeout);
        cleanup();
        setErrorMessage(error.message || 'Polling for call status failed.');
        setCallState('failed');
      }
    }, 5000); // Poll every 5 seconds
  };
  
  const startDurationTimer = () => {
      durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
      }, 1000);
  };

  const handleHangup = async () => {
    if (!activeCall?.call_id) return;
    setCallState('hangedup'); // Set state to indicate hangup is in progress
    try {
      await hangupCall(activeCall.call_id);
      toast({ title: 'Call Ended' });
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hangup Failed', description: error.message });
      setCallState('connected'); // Revert state if hangup fails
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
      case 'polling':
        return (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to {lead?.name}...</p>
            <p className="text-sm text-muted-foreground">{callState === 'initiating' ? 'Initiating call...' : `Status: ${activeCall?.status || 'Waiting for connection...'}`}</p>
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
