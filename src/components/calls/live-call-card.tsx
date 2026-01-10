
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ear, GitMerge, Mic, PhoneOff, User, Clock, RadioTower } from "lucide-react";
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LiveCallCardProps {
    call: any;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start text-sm">
        <Icon className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
        <span className="font-medium text-muted-foreground mr-2">{label}:</span>
        <span className="text-foreground truncate">{value}</span>
    </div>
);

export default function LiveCallCard({ call }: LiveCallCardProps) {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const updateDuration = () => {
            if (!call.call_time) return;
            const timeParts = call.call_time.split(':').map(Number);
            let totalSeconds = 0;
            if (timeParts.length === 3) {
                totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
            } else if (timeParts.length === 2) {
                totalSeconds = timeParts[0] * 60 + timeParts[1];
            } else if (timeParts.length === 1) {
                totalSeconds = timeParts[0];
            }
            setDuration(totalSeconds);
        };

        updateDuration();
        const interval = setInterval(() => {
            if (call.state?.toLowerCase() === 'answered') {
                setDuration(prev => prev + 1);
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [call.call_time, call.state]);

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const getStatusVariant = (status: string) => {
        switch(status?.toLowerCase()) {
            case 'answered': return 'success';
            case 'ringing': return 'warning';
            case 'missed': return 'destructive';
            default: return 'secondary';
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-medium">{call.customer_number || 'Unknown Number'}</CardTitle>
                        <div className="mt-1">
                           <Badge variant={getStatusVariant(call.state)} className="capitalize">{call.state}</Badge>
                        </div>
                    </div>
                    <div className="text-lg font-mono font-semibold text-primary">{formatDuration(duration)}</div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                 <DetailItem icon={User} label="Agent" value={call.agent_name || 'N/A'} />
                 <DetailItem icon={RadioTower} label="Direction" value={<span className='capitalize'>{call.direction === 2 ? 'Outbound' : 'Inbound'}</span>} />
                 <DetailItem icon={Clock} label="Created At" value={call.created_at} />
            </CardContent>
             <TooltipProvider>
                <div className="flex justify-around items-center p-2 border-t">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><Ear className="w-5 h-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Listen</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><Mic className="w-5 h-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Whisper</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><GitMerge className="w-5 h-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Barge</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon"><PhoneOff className="w-5 h-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Hang Up</p></TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </Card>
    );
}
