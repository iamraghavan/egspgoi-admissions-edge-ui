
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ear, GitMerge, Mic, PhoneOff, User, Clock, RadioTower } from "lucide-react";
import type { LiveCall } from "@/lib/types";
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
            // Assuming call.duration is in "HH:mm:ss" or "mm:ss" format
            const parts = call.duration.split(':').map(Number);
            let totalSeconds = 0;
            if (parts.length === 3) {
                totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                totalSeconds = parts[0] * 60 + parts[1];
            } else if (parts.length === 1) {
                totalSeconds = parts[0];
            }
            setDuration(totalSeconds);
        };
        updateDuration();
        const interval = setInterval(() => setDuration(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [call.duration]);

    const formatDuration = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const getStatusVariant = (status: string) => {
        switch(status?.toLowerCase()) {
            case 'answered': return 'success';
            case 'ringing': return 'warning';
            default: return 'secondary';
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-medium">{call.customer_number || 'Unknown Number'}</CardTitle>
                        <Badge variant={getStatusVariant(call.state)} className="capitalize mt-1">{call.state}</Badge>
                    </div>
                    <div className="text-lg font-mono font-semibold text-primary">{formatDuration(duration)}</div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                 <DetailItem icon={User} label="Agent" value={call.agent_name || 'N/A'} />
                 <DetailItem icon={RadioTower} label="Direction" value={<span className='capitalize'>{call.direction === 2 ? 'Outbound' : 'Inbound'}</span>} />
                 <DetailItem icon={Clock} label="Call Time" value={call.call_time} />
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
