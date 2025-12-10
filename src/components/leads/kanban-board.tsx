
'use client';

import * as React from 'react';
import { getLeads, getUserById, addLeadNote } from "@/lib/data";
import { Lead, User, LeadStatus } from "@/lib/types";
import { GripVertical, Mail, MessageSquare, Phone } from 'lucide-react';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { Button } from '@/components/ui/button-1';
import { Badge } from '@/components/ui/badge-2';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

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

interface LeadCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, 'value' | 'children'> {
  lead: KanbanLead;
  onAddNote: (lead: KanbanLead) => void;
}

function LeadCard({ lead, asHandle, onAddNote, ...props }: LeadCardProps) {
  const cardContent = (
    <div className="rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-sm leading-tight">{lead.name}</span>
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
            Last contact: {format(new Date(lead.lastContacted), 'PP')}
        </p>
        <div className="flex items-center justify-between text-muted-foreground mt-2">
            <Badge
                variant={lead.priority === 'high' ? 'destructive' : lead.priority === 'medium' ? 'primary' : 'warning'}
                appearance="outline"
                className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize shrink-0"
            >
                {lead.priority}
            </Badge>
            <div className='flex items-center gap-1'>
                <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild><Button asChild variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-primary"><a href={`tel:${lead.phone}`}><Phone className="size-4"/></a></Button></TooltipTrigger><TooltipContent><p>Call {lead.name}</p></TooltipContent></Tooltip>
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
}

function LeadColumn({ value, leads, isOverlay, onAddNote, ...props }: LeadColumnProps) {
  return (
        <KanbanColumn value={value} {...props} className="rounded-lg border bg-muted/50 p-2.5 shadow-inner flex flex-col">
          <div className="flex items-center justify-between mb-2.5 p-1">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm">{COLUMN_TITLES[value as KanbanColumnKey]}</span>
              <Badge variant="secondary">{leads.length}</Badge>
            </div>
            <KanbanColumnHandle asChild>
              <Button variant="ghost" size="sm" mode="icon" className="size-7">
                <GripVertical className="size-4" />
              </Button>
            </KanbanColumnHandle>
          </div>
          <ScrollArea className="flex-grow">
            <KanbanColumnContent value={value} className="flex flex-col gap-2.5 p-1 -m-1">
                {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} asHandle={!isOverlay} onAddNote={onAddNote} />
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
  const [columns, setColumns] = React.useState<Record<string, KanbanLead[]>>({});
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<KanbanLead | null>(null);
  const [noteContent, setNoteContent] = React.useState('');
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function processLeads() {
        if (!leads) return;
        const leadsWithDetails: KanbanLead[] = await Promise.all(leads.map(async (lead) => {
            const user = await getUserById(lead.assignedTo);
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
            let statusKey: KanbanColumnKey = "New";
            if (lead.status === "Won") statusKey = "On Board";
            else if (lead.status === "Lost") statusKey = "Failed";
            else if (["Contacted", "Qualified", "Proposal"].includes(lead.status)) statusKey = "Contacted";
            
            groupedByStatus[statusKey].push(lead);
        });
        
        setColumns(groupedByStatus);
    }
    processLeads();
  }, [leads]);

  const handleAddNoteClick = (lead: KanbanLead) => {
    setSelectedLead(lead);
    setNoteDialogOpen(true);
  };

  const handleNoteSubmit = async () => {
    if (!selectedLead || !noteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
        await addLeadNote(selectedLead.id, noteContent);
        toast({ title: "Note added successfully!" });
        setNoteDialogOpen(false);
        setNoteContent('');
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to add note", description: error.message });
    } finally {
        setIsSubmittingNote(false);
    }
  }

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 min-w-[1000px]">
          {Object.entries(columns).map(([columnValue, leads]) => (
            <LeadColumn key={columnValue} value={columnValue} leads={leads} onAddNote={handleAddNoteClick} />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>
      
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Note for {selectedLead?.name}</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
                <Textarea 
                    placeholder="Type your note here..." 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleNoteSubmit} disabled={isSubmittingNote}>
                    {isSubmittingNote ? "Adding..." : "Add Note"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
