'use client';
import { useState, useEffect } from 'react';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  type KanbanMoveEvent,
} from '@/components/ui/kanban';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadStatus } from '@/lib/types';
import { updateLeadStatus } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KanbanBoardClientProps {
  leads: Lead[];
  isLoading: boolean;
  onLeadUpdate: () => void;
}

type Columns = Record<LeadStatus, Lead[]>;

export default function KanbanBoardClient({ leads, isLoading, onLeadUpdate }: KanbanBoardClientProps) {
  const { toast } = useToast();
  const [columns, setColumns] = useState<Columns>({
    New: [],
    Contacted: [],
    Interested: [],
    Enrolled: [],
    Failed: [],
  });

  useEffect(() => {
    const newColumns: Columns = {
      New: [],
      Contacted: [],
      Interested: [],
      Enrolled: [],
      Failed: [],
    };
    leads.forEach((lead) => {
      if (newColumns[lead.status]) {
        newColumns[lead.status].push(lead);
      }
    });
    setColumns(newColumns);
  }, [leads]);

  const handleMove = async (event: KanbanMoveEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const newStatus = over.id as LeadStatus;
    const leadId = active.id as string;
    
    // Optimistic update
    const previousColumns = { ...columns };
    const activeColumnKey = Object.keys(columns).find(key => columns[key as LeadStatus].some(l => l.id === leadId)) as LeadStatus | undefined;
    
    if(!activeColumnKey) return;
    
    const activeColumn = [...columns[activeColumnKey]];
    const leadIndex = activeColumn.findIndex(l => l.id === leadId);
    const [movedLead] = activeColumn.splice(leadIndex, 1);
    
    const newColumns = { ...columns };
    newColumns[activeColumnKey] = activeColumn;

    if (!newColumns[newStatus]) {
      newColumns[newStatus] = [];
    }
    newColumns[newStatus].push({ ...movedLead, status: newStatus });
    
    setColumns(newColumns);

    try {
      await updateLeadStatus(leadId, newStatus);
      toast({
        title: 'Lead Updated',
        description: `Moved ${movedLead.name} to ${newStatus}.`,
      });
      onLeadUpdate(); // To re-sync parent state if needed
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update lead status.',
      });
      // Revert on failure
      setColumns(previousColumns);
    }
  };

  const getStatusIndicatorColor = (status: LeadStatus) => {
    switch (status) {
        case 'New': return 'border-blue-500';
        case 'Contacted': return 'border-yellow-500';
        case 'Interested': return 'border-orange-500';
        case 'Enrolled': return 'border-green-500';
        case 'Failed': return 'border-red-500';
        default: return 'border-gray-500';
    }
  }

  if (isLoading) {
      return (
        <div className="flex gap-6 p-1">
            {Object.keys(columns).map(status => (
                <div key={status} className="w-[300px] flex-shrink-0 space-y-2">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ))}
        </div>
      )
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap bg-muted/20 rounded-lg border">
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id} onMove={handleMove}>
        <KanbanBoard className="p-1">
          {Object.entries(columns).map(([status, leads]) => (
            <KanbanColumn key={status} value={status} className="w-[300px] flex-shrink-0 border-r last:border-r-0">
                <div className={cn(
                    'flex items-center justify-between p-2 mx-2 border-t-2',
                    getStatusIndicatorColor(status as LeadStatus)
                )}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{status}</h3>
                        <Badge variant="secondary" className='rounded-full px-1.5 text-xs h-5'>{leads.length}</Badge>
                    </div>
                </div>
              <KanbanColumnContent value={status} className="h-full min-h-[100px] p-2 rounded-b-md">
                {leads.map((lead) => (
                  <KanbanItem key={lead.id} value={lead.id}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-semibold text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                            Last contacted: {format(new Date(lead.last_contacted_at), 'P')}
                        </p>
                        {lead.source_website && (
                            <p className="text-xs text-muted-foreground capitalize">
                                Source: {lead.source_website.replace(/_/g, ' ')}
                            </p>
                        )}
                        <div className="flex items-center justify-end mt-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Avatar className="h-6 w-6">
                                            {lead.assigned_user?.avatarUrl && <AvatarImage src={lead.assigned_user.avatarUrl} />}
                                            <AvatarFallback className="text-xs">{lead.assigned_user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{lead.assigned_user?.name ?? "Unassigned"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  </KanbanItem>
                ))}
              </KanbanColumnContent>
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </Kanban>
       <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
