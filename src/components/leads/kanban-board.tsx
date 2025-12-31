

'use client';

import * as React from 'react';
import { getUserById, addLeadNote, updateLeadStatus, initiateCall } from "@/lib/data";
import { Lead, User, LeadStatus, Note } from "@/lib/types";
import { GripVertical, Mail, MessageSquare, Phone, Loader2, ArrowUpRight } from 'lucide-react';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanMoveEvent,
} from '@/components/ui/kanban';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface KanbanLead extends Lead {
    priority: 'low' | 'medium' | 'high';
    assignee?: User;
}

type KanbanColumnKey = "New" | "Contacted" | "On Board" | "Failed";

const COLUMN_TITLES: Record<KanbanColumnKey, string> = {
  "New": 'New',
  "Contacted": 'Contacted',
  "On Board": 'On Board',
  "Failed": 'Failed',
};

const statusToColumnMap: Record<string, KanbanColumnKey> = {
  'new': 'New',
  'contacted': 'Contacted',
  'qualified': 'Contacted',
  'proposal': 'Contacted',
  'won': 'On Board',
  'lost': 'Failed',
  'on board': 'On Board',
  'failed': 'Failed'
};

const columnToStatusMap: Record<KanbanColumnKey, LeadStatus> = {
    'New': 'New',
    'Contacted': 'Contacted',
    'On Board': 'On Board',
    'Failed': 'Failed'
}

interface LeadCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  lead: KanbanLead;
  onAddNote: (lead: KanbanLead) => void;
  onInitiateCall: (leadId: string) => void;
  onNavigate: (leadId: string) => void;
  isCalling: boolean;
}

function LeadCard({ lead, asHandle, onAddNote, onInitiateCall, onNavigate, isCalling, ...props }: LeadCardProps) {
  const cardContent = (
    <div className="rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => onNavigate(lead.id)} className="text-left">
            <span className="font-medium text-sm leading-tight hover:underline">{lead.name}</span>
          </button>
           {lead.assignee && (
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                    <Avatar className="size-6">
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
         <p className="text-xs text-muted-foreground">
            Last contact: {lead.last_contacted_at ? format(new Date(lead.last_contacted_at), 'PP') : 'N/A'}
        </p>
        <div className="flex items-center justify-between text-muted-foreground mt-2">
            <Badge
                variant={lead.priority === 'high' ? 'destructive' : lead.priority === 'medium' ? 'default' : 'secondary'}
                className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize shrink-0"
            >
                {lead.priority}
            </Badge>
            <div className='flex items-center gap-1'>
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
                    <Tooltip><TooltipTrigger asChild><Button asChild variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary"><a href={`mailto:${lead.email}`}><Mail className="size-4"/></a></Button></TooltipTrigger><TooltipContent><p>Email {lead.name}</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary" onClick={() => onAddNote(lead)}><MessageSquare className="size-4"/></Button></TooltipTrigger><TooltipContent><p>Add Note</p></TooltipContent></Tooltip>
                </TooltipProvider>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <KanbanItem value={lead.id} {...props}>
      {asHandle ? <KanbanItemHandle>{cardContent}</KanbanItemHandle> : cardContent}
    </KanbanItem>
  );
}

interface LeadColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, 'children'> {
  leads: KanbanLead[];
  isOverlay?: boolean;
  onAddNote: (lead: KanbanLead) => void;
  onInitiateCall: (leadId: string) => void;
  onNavigate: (leadId: string) => void;
  callingLeadId: string | null;
}

function LeadColumn({ value, leads, isOverlay, onAddNote, onInitiateCall, onNavigate, callingLeadId, ...props }: LeadColumnProps) {
  return (
        <KanbanColumn value={value} {...props} className="rounded-lg border bg-muted p-2.5 shadow-inner flex flex-col">
          <div className="flex items-center justify-between mb-2.5 p-1">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm">{COLUMN_TITLES[value as KanbanColumnKey]}</span>
              <Badge variant="secondary">{leads.length}</Badge>
            </div>
            <KanbanColumnHandle asChild>
              <Button variant="ghost" size="sm" className="size-7">
                <GripVertical className="size-4" />
              </Button>
            </KanbanColumnHandle>
          </div>
          <ScrollArea className="flex-grow">
            <KanbanColumnContent value={value} className="flex flex-col gap-2.5 p-1 -m-1">
                {leads.filter(lead => lead && lead.id).map((lead) => (
                <LeadCard key={lead.id} lead={lead} asHandle={!isOverlay} onAddNote={onAddNote} onInitiateCall={onInitiateCall} onNavigate={onNavigate} isCalling={callingLeadId === lead.id} />
                ))}
            </KanbanColumnContent>
          </ScrollArea>
        </KanbanColumn>
  );
}

interface KanbanBoardComponentProps {
    leads: Lead[];
    isLoading: boolean;
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

export default function KanbanBoardComponent({ leads, isLoading, setLeads }: KanbanBoardComponentProps) {
  const [columns, setColumns] = React.useState<Record<KanbanColumnKey, KanbanLead[]>>({
      "New": [],
      "Contacted": [],
      "On Board": [],
      "Failed": [],
  });
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<KanbanLead | null>(null);
  const [noteContent, setNoteContent] = React.useState('');
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false);
  const { toast } = useToast();
  const [callingLeadId, setCallingLeadId] = React.useState<string | null>(null);
  const router = useRouter();
  const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string; };

  const findContainer = React.useCallback(
    (id: string) => {
      return Object.keys(columns).find(key => columns[key as KanbanColumnKey].some(item => item.id === id));
    },
    [columns]
  );

  React.useEffect(() => {
    async function processLeads() {
        if (!leads) return;
        const leadsWithDetails: KanbanLead[] = await Promise.all(
          leads
          .filter(lead => lead && lead.id)
          .map(async (lead) => {
            const user = lead.agent_id ? await getUserById(lead.agent_id) : undefined;
            const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
            return {
                ...lead,
                priority: priorities[Math.floor(Math.random() * priorities.length)], // Assign random priority
                assignee: user,
            }
        }));

        const groupedByStatus: Record<KanbanColumnKey, KanbanLead[]> = {
            "New": [],
            "Contacted": [],
            "On Board": [],
            "Failed": [],
        };
        
        leadsWithDetails.forEach(lead => {
            const columnKey = statusToColumnMap[lead.status.toLowerCase()];
            if (columnKey && groupedByStatus[columnKey]) {
                groupedByStatus[columnKey].push(lead);
            } else {
                groupedByStatus["New"].push(lead); // Default to "New" if status is unknown
            }
        });
        
        setColumns(groupedByStatus);
    }
    processLeads();
  }, [leads]);

  const handleAddNoteClick = (lead: KanbanLead) => {
    setSelectedLead(lead);
    setNoteDialogOpen(true);
  };
  
  const handleInitiateCall = async (leadId: string) => {
    setCallingLeadId(leadId);
    try {
        await initiateCall(leadId);
        toast({
            title: "Call Initiated",
            description: `A call is being connected.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Failed to Initiate Call",
            description: error.message,
        });
    } finally {
        setCallingLeadId(null);
    }
  };

  const handleNavigate = (leadId: string) => {
    router.push(`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/leads/${leadId}`);
  };

  const handleNoteSubmit = async () => {
    if (!selectedLead || !noteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
        const newNote = await addLeadNote(selectedLead.id, noteContent);
        toast({ title: "Note added successfully!" });
  
        // Optimistically update the notes in the UI
        const updatedLead = { ...selectedLead, notes: [...(selectedLead.notes || []), newNote] };
        setSelectedLead(updatedLead);
  
        // Also update the main leads state
        setLeads(prevLeads => prevLeads.map(l => l.id === selectedLead.id ? updatedLead : l));
  
        setNoteContent('');
        // No need to close dialog, user might want to add another note or see the history
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to add note", description: error.message });
    } finally {
        setIsSubmittingNote(false);
    }
  }

  const handleMove = async (event: KanbanMoveEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const leadId = active.id as string;
    
    const activeContainer = findContainer(leadId);
    let overContainer = findContainer(over.id as string);
    if (!overContainer) {
      overContainer = Object.keys(columns).includes(over.id as string) ? (over.id as string) : undefined;
    }
  
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
    
    const newStatus = columnToStatusMap[overContainer as KanbanColumnKey];
    if (!newStatus) return;
  
    // Optimistic UI update
    const originalColumns = JSON.parse(JSON.stringify(columns)); // Deep copy
  
    setColumns(prevColumns => {
      const activeItems = Array.from(prevColumns[activeContainer as KanbanColumnKey]);
      const overItems = Array.from(prevColumns[overContainer as KanbanColumnKey]);
      
      const activeIndex = activeItems.findIndex(item => item.id === leadId);
      const [movedItem] = activeItems.splice(activeIndex, 1);
      
      let overIndex = overItems.findIndex(item => item.id === over.id);
      if (overIndex === -1 && over.id === overContainer) {
        overIndex = overItems.length;
      }
  
      overItems.splice(overIndex, 0, movedItem);
  
      return {
        ...prevColumns,
        [activeContainer as KanbanColumnKey]: activeItems,
        [overContainer as KanbanColumnKey]: overItems,
      };
    });
  
    try {
      await updateLeadStatus(leadId, newStatus);
      // Update the lead's status in the main `leads` state
      setLeads(prevLeads => prevLeads.map(l => (l.id === leadId ? { ...l, status: newStatus } : l)));
      toast({
        title: "Lead Updated",
        description: `Lead status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      // Revert UI on failure
      setColumns(originalColumns);
      toast({
        variant: "destructive",
        title: "Failed to Update Lead",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };


  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.keys(COLUMN_TITLES).map(title => (
                 <div key={title} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-24 w-full mb-2" />
                    <Skeleton className="h-24 w-full" />
                 </div>
            ))}
        </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id} onMove={handleMove}>
        <KanbanBoard className="grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-5 min-w-[1000px]">
          {Object.entries(columns).map(([columnValue, leads]) => (
            <LeadColumn key={columnValue} value={columnValue} leads={leads} onAddNote={handleAddNoteClick} onInitiateCall={handleInitiateCall} onNavigate={handleNavigate} callingLeadId={callingLeadId}/>
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>
      
      <Dialog open={noteDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
              setNoteContent('');
              setSelectedLead(null);
          }
          setNoteDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Notes for {selectedLead?.name}</DialogTitle>
                <DialogDescription>View history and add a new note.</DialogDescription>
            </DialogHeader>
            <div className='py-4 space-y-4'>
                <div className='space-y-2'>
                    <h4 className="text-sm font-medium">Add a new note</h4>
                    <Textarea 
                        placeholder="Type your note here..." 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={3}
                    />
                </div>
                 <div className='space-y-2'>
                    <h4 className="text-sm font-medium">History</h4>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-3">
                         {selectedLead?.notes && selectedLead.notes.length > 0 ? (
                            <ul className="space-y-4">
                            {[...selectedLead.notes].reverse().map((note, index) => (
                                <li key={note.id || index} className="flex gap-3">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm">{note.content}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Added by {note.author_name || 'Unknown'} - {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No notes for this lead yet.</p>
                        )}
                    </ScrollArea>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleNoteSubmit} disabled={isSubmittingNote || !noteContent.trim()}>
                    {isSubmittingNote ? "Adding..." : "Add Note"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
