
'use client';

import { useDialer } from '@/hooks/use-dialer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { hangupCall } from '@/lib/data';

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

export function ActiveCallCard() {
    const { activeCall, endCall, callStatus } = useDialer();
    const [duration, setDuration] = useState(0);
    const [isHangingUp, setIsHangingUp] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (callStatus === 'connected' && activeCall) {
            setDuration(Math.floor((Date.now() - activeCall.startTime) / 1000));
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [activeCall, callStatus]);

    const handleHangUp = async () => {
        if (!activeCall) return;
        setIsHangingUp(true);
        try {
            await hangupCall(activeCall.callId);
            toast({ title: 'Call Ended' });
            endCall();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Hang Up Failed', description: error.message });
        } finally {
            setIsHangingUp(false);
        }
    };

    if (callStatus === 'idle' || !activeCall) return null;

    return (
        <Card className="bg-primary/10 border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {callStatus === 'connecting' && <Loader2 className="h-5 w-5 animate-spin" />}
                    Active Call
                </CardTitle>
                <CardDescription>
                    {callStatus === 'connecting' ? 'Establishing connection...' : `In call with ${activeCall.leadName}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="text-4xl font-mono font-bold text-center">
                    {callStatus === 'connected' ? formatDuration(duration) : '00:00'}
                </div>
                 <Button
                    variant="destructive"
                    onClick={handleHangUp}
                    disabled={isHangingUp || callStatus !== 'connected'}
                    className="w-full"
                >
                    {isHangingUp ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <PhoneOff className="mr-2 h-5 w-5" />
                    )}
                    Hang Up
                </Button>
            </CardContent>
        </Card>
    );
}
