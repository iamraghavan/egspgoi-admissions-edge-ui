
'use client';

import { KanbanLead } from './kanban-board';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpRight, Loader2, Phone, Mail, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanCardProps {
    lead: KanbanLead;
    onAddNote: (lead: KanbanLead) => void;
    onInitiateCall: (leadId: string) => void;
    onNavigate: (leadId: string) => void;
    isCalling: boolean;
}

export function KanbanCard({ lead, onAddNote, onInitiateCall, onNavigate, isCalling }: KanbanCardProps) {
    return (
        <div className="group/card rounded-lg border bg-card text-card-foreground shadow-sm p-3 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <button onClick={() => onNavigate(lead.id)} className="text-left pr-2">
                    <span className="font-semibold text-sm leading-tight hover:underline">{lead.name}</span>
                </button>
                {lead.assignee && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="size-7">
                                    {lead.assignee.avatarUrl && <AvatarImage src={lead.assignee.avatarUrl} />}
                                    <AvatarFallback>{lead.assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Assigned to {lead.assignee.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
                <div className='flex items-center text-xs'>
                     <Calendar className="size-3.5 mr-1.5" />
                    <span>
                        {lead.last_contacted_at ? format(new Date(lead.last_contacted_at), 'MMM dd') : 'N/A'}
                    </span>
                </div>
                <div className='flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary" onClick={() => onNavigate(lead.id)}>
                                    <ArrowUpRight className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View Details</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary" onClick={() => onInitiateCall(lead.id)} disabled={isCalling}>
                                    {isCalling ? <Loader2 className="size-4 animate-spin" /> : <Phone className="size-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Call {lead.name}</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary">
                                    <a href={`mailto:${lead.email}`}><Mail className="size-4"/></a>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Email {lead.name}</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary" onClick={() => onAddNote(lead)}>
                                    <MessageSquare className="size-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Add Note</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
