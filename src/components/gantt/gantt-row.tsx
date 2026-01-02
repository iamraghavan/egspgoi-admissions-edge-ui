
import { Lead } from '@/lib/types';
import { Timeline } from './hooks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface GanttRowProps {
  lead: Lead;
  timeline: Timeline;
  isOdd: boolean;
}

export function GanttRow({ lead, timeline, isOdd }: GanttRowProps) {
  const startDate = new Date(lead.created_at);
  const endDate = lead.status === 'On Board' || lead.status === 'Failed' 
    ? new Date(lead.last_contacted_at) 
    : new Date();

  const startOffset = timeline.getPositionFromDate(startDate);
  const endOffset = timeline.getPositionFromDate(endDate);
  const width = Math.max(0, endOffset - startOffset);
  const barColor = lead.status === 'On Board' ? 'bg-green-500' : lead.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={cn("relative h-10 border-t", isOdd && "bg-muted/50")}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute h-6 top-2 rounded-md ${barColor} opacity-75 hover:opacity-100 transition-opacity`}
              style={{ left: `${startOffset}px`, width: `${width}px` }}
            >
              <div className="px-2 py-0.5 text-white text-xs font-medium truncate flex items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                {lead.name}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-bold">{lead.name}</p>
            <p>Status: {lead.status}</p>
            <p>
              Duration: {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
