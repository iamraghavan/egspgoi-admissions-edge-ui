
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
import { useDatabase } from '@/firebase';
import { ref, onValue, off, type DataSnapshot } from 'firebase/database';

type CallState = 'initiating' | 'ringing' | 'connected' | 'failed' | 'hangedup' | 'not_found';

interface ActiveCallDetails {
    call_id: string;
    status: string;
    duration: string;
    agent_name: string;
    customer_number: string;
    unique_id: string;
    call_status?: string;
}

interface CallStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lead: Lead | null;
}

function formatDuration(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
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
  const [callState, setCallState] = useState<CallState>('initiating');
  const [activeCall, setActiveCall] = useState<ActiveCallDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const database = useDatabase();

  const cleanup = useCallback(() => {
    console.log("Cleaning up call dialog resources.");
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setCallState('initiating');
    setActiveCall(null);
    setErrorMessage(null);
    setDuration(0);
  }, []);

  // Effect to initiate the call
  useEffect(() => {
    if (!isOpen || !lead) return;

    let isComponentMounted = true;

    const startCallProcess = async () => {
        if (!isComponentMounted) return;

        console.log('Starting call process...');
        setCallState('initiating');
        
        try {
            const initiationResponse = await initiateCall(lead.id);
            if (!initiationResponse?.ref_id) {
                throw new Error('Did not receive a ref_id to track the call.');
            }
            console.log("Call initiated successfully, ref_id:", initiationResponse.ref_id);
            if (isComponentMounted) {
                setCallState('ringing');
            }
        } catch (error: any) {
            console.error("Error in startCallProcess:", error.message);
            if (isComponentMounted) {
                setErrorMessage(error.message || 'Failed to initiate call.');
                setCallState('failed');
            }
        }
    };

    startCallProcess();

    return () => {
        isComponentMounted = false;
        cleanup();
    };
  }, [isOpen, lead, cleanup]);

  // Effect to listen for Firebase updates
  useEffect(() => {
    if (!isOpen || !lead || !database) return;

    const callRefPath = `smartflo_calls/${lead.id}`;
    console.log(`Listening for updates on: ${callRefPath}`);
    const callRef = ref(database, callRefPath);

    const handleSnapshot = (snapshot: DataSnapshot) => {
      console.log("🔥 Received Call Update from Firebase:", snapshot.val());
      const callEvent = snapshot.val();
      
      if (!callEvent) return;

      setActiveCall(prev => ({ ...(prev || {}), ...callEvent }));

      const newStatus = callEvent.call_status?.toLowerCase();

      if (newStatus === 'answered by agent' || newStatus === 'answered') {
        if (callState !== 'connected') {
          setCallState('connected');
          startDurationTimer();
        }
      } else if (newStatus === 'hangup' || newStatus === 'missed' || newStatus === 'cancel') {
        if (isOpen) {
          toast({ title: "Call Ended", description: `The call was ${newStatus}.` });
          onOpenChange(false);
        }
      }
    };

    const unsubscribeFirebase = onValue(callRef, handleSnapshot, (error) => {
        console.error("Firebase listener error:", error);
        setErrorMessage("Could not connect to real-time call updates.");
        setCallState('failed');
    });

    return () => {
      console.log("Unsubscribing from Firebase path:", callRefPath);
      unsubscribeFirebase();
    };
  }, [isOpen, lead, database, callState, onOpenChange, toast]);
  
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
      if (activeCall?.status) setCallState(activeCall.status.toLowerCase() as CallState);
    }
  };

  const getStatusVariant = (status: string | undefined) => {
      const lowerStatus = status?.toLowerCase();
      if (lowerStatus === 'answered by agent' || lowerStatus === 'answered') {
          return 'success';
      }
      if (lowerStatus === 'ringing') {
          return 'warning';
      }
      return 'default';
  }

  const renderContent = () => {
    switch (callState) {
      case 'initiating':
      case 'ringing':
        return (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to {lead?.name}...</p>
            <p className="text-sm text-muted-foreground capitalize">{activeCall?.call_status || callState}...</p>
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
                <Badge variant={getStatusVariant(activeCall?.call_status)} className="capitalize text-sm">
                    {activeCall?.call_status}
                </Badge>
                <p className="font-mono text-2xl font-semibold">{formatDuration(duration)}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-sm">
                <CallDetailItem icon={User} label="Agent" value={activeCall?.agent_name || '...'} />
                <CallDetailItem icon={Phone} label="Number" value={activeCall?.customer_number || lead?.phone || '...'} />
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
