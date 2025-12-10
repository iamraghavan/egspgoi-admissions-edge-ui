'use client';

import * as React from 'react';
import { getLeads, getUserById } from "@/lib/data";
import { Lead, User, LeadStatus } from "@/lib/types";
import { GripVertical } from 'lucide-react';

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

interface KanbanLead extends Lead {
    priority: 'low' | 'medium' | 'high';
    assigneeAvatar?: string;
    assigneeName?: string;
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
  asHandle?: boolean;
}

function LeadCard({ lead, asHandle, ...props }: LeadCardProps) {
  const cardContent = (
    <div className="rounded-md border bg-card p-3 shadow-xs">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 font-medium text-sm">{lead.name}</span>
          <Badge
            variant={lead.priority === 'high' ? 'destructive' : lead.priority === 'medium' ? 'primary' : 'warning'}
            appearance="outline"
            className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize shrink-0"
          >
            {lead.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          {lead.assigneeName && (
            <div className="flex items-center gap-1">
              <Avatar className="size-4">
                {lead.assigneeAvatar && <AvatarImage src={lead.assigneeAvatar} />}
                <AvatarFallback>{lead.assigneeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="line-clamp-1">{lead.assigneeName}</span>
            </div>
          )}
          {lead.lastContacted && <time className="text-[10px] tabular-nums whitespace-nowrap">{new Date(lead.lastContacted).toLocaleDateString()}</time>}
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
}

function LeadColumn({ value, leads, isOverlay, ...props }: LeadColumnProps) {
  return (
        <KanbanColumn value={value} {...props} className="rounded-md border bg-card p-2.5 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm">{COLUMN_TITLES[value as KanbanColumnKey]}</span>
              <Badge variant="secondary">{leads.length}</Badge>
            </div>
            <KanbanColumnHandle asChild>
              <Button variant="dim" size="sm" mode="icon">
                <GripVertical />
              </Button>
            </KanbanColumnHandle>
          </div>
          <KanbanColumnContent value={value} className="flex flex-col gap-2.5 p-0.5">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} asHandle={!isOverlay} />
            ))}
          </KanbanColumnContent>
        </KanbanColumn>
  );
}

export default function KanbanBoardComponent() {
  const [columns, setColumns] = React.useState<Record<string, KanbanLead[]>>({});
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        const leadsData = await getLeads();
        
        const leadsWithPriority: KanbanLead[] = await Promise.all(leadsData.map(async (lead) => {
            const user = await getUserById(lead.assignedTo);
            const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
            return {
                ...lead,
                priority: priorities[Math.floor(Math.random() * priorities.length)], // Assign random priority
                assigneeName: user?.name,
                assigneeAvatar: user?.avatarUrl,
            }
        }));

        const groupedByStatus: Record<KanbanColumnKey, KanbanLead[]> = {
            "New": [],
            "Contacted": [],
            "On Board": [],
            "Failed": [],
        };
        
        leadsWithPriority.forEach(lead => {
            switch (lead.status) {
                case "Won":
                    groupedByStatus["On Board"].push(lead);
                    break;
                case "Lost":
                    groupedByStatus["Failed"].push(lead);
                    break;
                case "Qualified":
                case "Proposal":
                case "Contacted":
                    groupedByStatus["Contacted"].push(lead);
                    break;
                case "New":
                    groupedByStatus["New"].push(lead);
                    break;
                default:
                    // This can be a fallback, maybe for new unhandled statuses
                    if (groupedByStatus[lead.status as KanbanColumnKey]) {
                        groupedByStatus[lead.status as KanbanColumnKey].push(lead);
                    }
                    break;
            }
        });
        
        setColumns(groupedByStatus);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
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
    <div className="overflow-x-auto">
      <Kanban value={columns} onValueChange={setColumns} getItemValue={(item) => item.id}>
        <KanbanBoard className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(columns).map(([columnValue, leads]) => (
            <LeadColumn key={columnValue} value={columnValue} leads={leads} />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>
    </div>
  );
}
