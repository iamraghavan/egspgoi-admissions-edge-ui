
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
import { Loader2, Phone, PhoneOff, AlertCircle } from 'lucide-react';
import { initiateCall, pollForActiveCall, hangupCall } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/lib/types';
import { Badge } from '../ui/badge';

type CallState = 'idle' | 'initiating' | 'polling' | 'connected' | 'failed' | 'hangedup';

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

export function CallStatusDialog({ isOpen, onOpenChange, lead }: CallStatusDialogProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    pollingIntervalRef.current = null;
    durationIntervalRef.current = null;
    setCallState('idle');
    setCallId(null);
    setErrorMessage(null);
    setDuration(0);
  }, []);

  useEffect(() => {
    if (isOpen && lead) {
      startCallProcess();
    } else {
      cleanup();
    }
    return cleanup;
  }, [isOpen, lead]);


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
    
    // Stop polling after 30 seconds if not connected
    const pollingTimeout = setTimeout(() => {
      if (pollingIntervalRef.current) {
        cleanup();
        setCallState('failed');
        setErrorMessage('Call did not connect in time. Please try again.');
      }
    }, 30000);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const pollResponse = await pollForActiveCall(pollUrl);
        if (pollResponse?.active && pollResponse.call_id) {
          clearTimeout(pollingTimeout);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

          setCallId(pollResponse.call_id);
          setCallState('connected');
          startDurationTimer();
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
    if (!callId) return;
    setCallState('hangedup'); // Set state to indicate hangup is in progress
    try {
      await hangupCall(callId);
      toast({ title: 'Call Ended' });
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Hangup Failed', description: error.message });
      setCallState('connected'); // Revert state if hangup fails
    }
  };

  const renderContent = () => {
    switch (callState) {
      case 'initiating':
      case 'polling':
        return (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Connecting to {lead?.name}...</p>
            <p className="text-sm text-muted-foreground">{callState === 'initiating' ? 'Initiating call...' : 'Waiting for connection...'}</p>
          </div>
        );
      case 'connected':
        return (
           <div className="flex flex-col items-center justify-center h-48 gap-4">
            <div className="text-center">
                <p className="text-lg font-medium">In call with</p>
                <p className="text-2xl font-bold text-primary">{lead?.name}</p>
            </div>
            <div className='flex items-center gap-2'>
                <Badge variant="default" className="bg-green-600">Connected</Badge>
                <p className="font-mono text-xl font-semibold">{formatDuration(duration)}</p>
            </div>
          </div>
        );
      case 'failed':
         return (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Call Failed</p>
            <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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
                <Button onClick={handleHangup} disabled={!callId || callState === 'hangedup'} variant="destructive" className="w-full">
                {callState === 'hangedup' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PhoneOff className="mr-2 h-5 w-5" />}
                Hang Up
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
