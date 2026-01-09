
'use client';

import { useDialer } from '@/hooks/use-dialer';
import { Button } from '@/components/ui/button';
import { PhoneOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { hangupCall } from '@/lib/data';

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

export function ActiveCallBar() {
    const { activeCall, endCall } = useDialer();
    const [duration, setDuration] = useState(0);
    const [isHangingUp, setIsHangingUp] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (activeCall) {
            setDuration(Math.floor((Date.now() - activeCall.startTime) / 1000));
            const timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeCall]);

    const handleHangUp = async () => {
        if (!activeCall) return;
        setIsHangingUp(true);
        try {
            await hangupCall(activeCall.callId);
            toast({ title: 'Call Ended' });
            
            // End the call and trigger the refetch callback after a delay
            endCall();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Hang Up Failed', description: error.message });
        } finally {
            setIsHangingUp(false);
        }
    };

    if (!activeCall) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-background border shadow-lg rounded-lg p-4 w-80 flex items-center justify-between">
            <div>
                <p className="font-semibold">{activeCall.leadName}</p>
                <p className="text-sm text-muted-foreground">In call... {formatDuration(duration)}</p>
            </div>
            <Button
                variant="destructive"
                size="icon"
                onClick={handleHangUp}
                disabled={isHangingUp}
            >
                {isHangingUp ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <PhoneOff className="h-5 w-5" />
                )}
            </Button>
        </div>
    );
}
