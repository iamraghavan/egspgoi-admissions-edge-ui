"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ear, GitMerge, Mic, PhoneOff } from "lucide-react";
import type { LiveCall } from "@/lib/types";
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LiveCallCardProps {
    call: LiveCall;
}

export default function LiveCallCard({ call }: LiveCallCardProps) {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const updateDuration = () => {
            const now = Date.now();
            setDuration(Math.floor((now - call.startTime) / 1000));
        };
        updateDuration();
        const interval = setInterval(updateDuration, 1000);
        return () => clearInterval(interval);
    }, [call.startTime]);

    const formatDuration = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{call.leadName}</CardTitle>
                <div className="text-lg font-mono font-semibold text-primary">{formatDuration(duration)}</div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                    <Avatar>
                        <AvatarFallback>{call.agentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">Agent</p>
                        <p className="text-sm text-muted-foreground">{call.agentName}</p>
                    </div>
                </div>

                <TooltipProvider>
                    <div className="flex justify-around items-center pt-4 border-t">
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
            </CardContent>
        </Card>
    );
}
