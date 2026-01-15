
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
import { Loader2, Phone, PhoneOff, AlertCircle, User, Clock, Radio, Info } from 'lucide-react';
import { initiateCall, hangupCall } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useDatabase } from '@/firebase';
import { ref, onValue, off, type DataSnapshot } from 'firebase/database';

type CallState = 'initiating' | 'ringing' | 'connected' | 'failed' | 'hangedup';

interface ActiveCallDetails {
    call_id?: string;
    status?: string;
    call_status?: string;
    direction?: string;
    start_stamp?: string;
    answer_stamp?: string;
    end_stamp?: string;
    billsec?: string;
    duration?: string;
    recording_url?: string;
    agent_name?: string;
    customer_number?: string;
}

interface CallStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lead: Lead | null;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => {
    if (!value) return null;
    return (
        <div className="flex items-center text-sm">
            <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-medium text-muted-foreground mr-2">{label}:</span>
            <span className="text-foreground">{value}</span>
        </div>
    );
};


export function CallStatusDialog({ isOpen, onOpenChange, lead }: CallStatusDialogProps) {
  const [callState, setCallState] = useState<CallState>('initiating');
  const [activeCall, setActiveCall] = useState<ActiveCallDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uniqueCallId, setUniqueCallId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const database = useDatabase();
  const callRef = useRef<any>(null);
  const unsubscribeFirebase = useRef<any>(null);


  const cleanup = useCallback(() => {
    console.log("Cleaning up call dialog resources.");
     if (unsubscribeFirebase.current) {
      console.log("Unsubscribing from Firebase path:", callRef.current?.toString());
      unsubscribeFirebase.current();
      unsubscribeFirebase.current = null;
    }
    setCallState('initiating');
    setActiveCall(null);
    setErrorMessage(null);
    setUniqueCallId(null);
    callRef.current = null;
  }, []);

  // Effect to initiate the call and set up the listener
  useEffect(() => {
    if (!isOpen || !lead || !database) {
      if (!isOpen) cleanup();
      return;
    }

    let isComponentMounted = true;
    
    const startCallProcess = async () => {
      console.log('Starting call process...');
      setCallState('initiating');
      try {
        const session_id = await initiateCall(lead.id);
        console.log("Call initiated successfully, ref_id:", session_id);
        
        if (isComponentMounted) {
            setUniqueCallId(session_id);
            const path = `smartflo_calls/${session_id}`;
            callRef.current = ref(database, path);
            console.log("Listening for updates on:", path);
            
            unsubscribeFirebase.current = onValue(callRef.current, (snapshot) => {
                console.log("🔥 Received Call Update from Firebase:", snapshot.val());
                const data = snapshot.val();
                if (data) {
                    setActiveCall(prev => ({...prev, ...data}));
                    
                    if(data.call_id && localStorage.getItem('call_id') !== data.call_id){
                        localStorage.setItem('call_id', data.call_id);
                        console.log('Stored call_id in localStorage:', data.call_id);
                    }

                    const newStatus = data.call_status?.toLowerCase();
                    if (newStatus === 'answered' || newStatus === 'answered by agent') {
                        setCallState('connected');
                    } else if (newStatus === 'hangup' || newStatus === 'missed' || newStatus === 'cancel') {
                        toast({ title: "Call Ended", description: `The call was ${newStatus}.` });
                        onOpenChange(false);
                    } else {
                        setCallState('ringing');
                    }
                }
            }, (error) => {
                console.error("Firebase listener error:", error);
                setErrorMessage("Could not connect to real-time call updates. " + error.message);
                setCallState('failed');
            });
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
  }, [isOpen, lead, database, onOpenChange, toast, cleanup]);

  const handleHangup = async () => {
    const callIdToHangup = activeCall?.call_id || localStorage.getItem('call_id');
    if (!callIdToHangup) {
        toast({ variant: 'destructive', title: 'Hangup Failed', description: "Call ID not available yet." });
        return;
    };

    setCallState('hangedup');
    try {
      await hangupCall(callIdToHangup);
      toast({ title: 'Hangup Initiated' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hangup Failed', description: error.message });
      if (activeCall?.status) setCallState(activeCall.status.toLowerCase() as CallState);
    }
  };

  const getStatusVariant = (status: string | undefined) => {
      const lowerStatus = status?.toLowerCase();
      if (lowerStatus?.includes('answered')) {
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
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to {lead?.name}...</p>
            <p className="text-sm text-muted-foreground capitalize">{activeCall?.call_status || callState}...</p>
          </div>
        );
      case 'connected':
      case 'hangedup':
        return (
           <div className="flex flex-col items-center justify-center min-h-[250px] gap-4">
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
                {activeCall?.billsec && <p className="font-mono text-xl font-semibold">{activeCall.billsec}s</p>}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-sm">
                <DetailItem icon={User} label="Agent" value={activeCall?.agent_name} />
                <DetailItem icon={Radio} label="Direction" value={activeCall?.direction} />
                <DetailItem icon={Clock} label="Started" value={activeCall?.start_stamp} />
                <DetailItem icon={Phone} label="Answered" value={activeCall?.answer_stamp} />
                <DetailItem icon={Info} label="Call ID" value={activeCall?.call_id} />
            </div>
          </div>
        );
      case 'failed':
         return (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Call Failed</p>
            <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
          </div>
        );
      default:
        return (
             <div className="flex flex-col items-center justify-center min-h-[250px] gap-4">
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
            {`Attempting to call ${lead?.phone}`}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter className="mt-4">
            {callState === 'failed' ? (
                <Button onClick={() => onOpenChange(false)} className="w-full">Close</Button>
            ) : (
                <Button onClick={handleHangup} disabled={callState === 'hangedup' || callState === 'initiating'} variant="destructive" className="w-full">
                {callState === 'hangedup' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PhoneOff className="mr-2 h-5 w-5" />}
                Hang Up
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
