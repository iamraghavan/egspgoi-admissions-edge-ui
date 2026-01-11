
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
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Lead, LeadStatus } from '@/lib/types';
import { updateLeadStatus } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

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
        case 'New': return 'bg-blue-500';
        case 'Contacted': return 'bg-yellow-500';
        case 'Interested': return 'bg-orange-500';
        case 'Enrolled': return 'bg-green-500';
        case 'Failed': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
  }

  if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.keys(columns).map(status => (
                <div key={status} className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ))}
        </div>
      )
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id} onMove={handleMove}>
        <KanbanBoard className="md:w-full">
          {Object.entries(columns).map(([status, leads]) => (
            <KanbanColumn key={status} value={status}>
                <div className='flex items-center gap-2 mb-2 p-2'>
                    <span className={cn('w-3 h-3 rounded-full', getStatusIndicatorColor(status as LeadStatus))} />
                    <h3 className="font-semibold">{status}</h3>
                    <Badge variant="secondary" className='ml-1'>{leads.length}</Badge>
                </div>
              <KanbanColumnContent value={status} className="h-full">
                {leads.map((lead) => (
                  <KanbanItem key={lead.id} value={lead.id}>
                    <Card className="relative overflow-hidden">
                        <span className={cn("absolute left-0 top-0 h-full w-1.5", getStatusIndicatorColor(lead.status as LeadStatus))} />
                      <CardContent className="p-3 pl-4">
                        <p className="font-semibold mb-2">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.course}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}
                          </span>
                          <Avatar className="h-6 w-6">
                            {lead.assigned_user?.avatarUrl && <AvatarImage src={lead.assigned_user.avatarUrl} />}
                            <AvatarFallback>{lead.assigned_user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                          </Avatar>
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
