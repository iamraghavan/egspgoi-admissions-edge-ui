
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CallLog } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, PlayCircle } from "lucide-react"

const formatDuration = (secondsStr: string) => {
    const seconds = parseInt(secondsStr, 10);
    if(isNaN(seconds) || seconds < 0) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | null | undefined => {
    switch(status?.toLowerCase()) {
        case 'answered': return 'success';
        case 'missed': return 'destructive';
        case 'not_answered': return 'destructive';
        case 'ringing': return 'warning';
        default: return 'secondary';
    }
}

export const callLogsColumns: ColumnDef<CallLog>[] = [
  {
    accessorKey: "start_stamp",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("start_stamp")}</div>,
  },
  {
    accessorKey: "call_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("call_status") as string;
      return <Badge variant={getStatusVariant(status)} className="capitalize">{status}</Badge>
    },
  },
  {
    accessorKey: "direction",
    header: "Direction",
     cell: ({ row }) => (
      <span className="capitalize">{row.getValue("direction")}</span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => formatDuration(row.getValue("duration")),
  },
   {
    accessorKey: "answered_agent_name",
    header: "Agent",
    cell: ({ row }) => row.original.answered_agent_name || 'N/A'
  },
  {
    accessorKey: "recording_url",
    header: "Recording",
    cell: ({ row }) => {
      const url = row.getValue("recording_url") as string;
      if (!url) return <span>N/A</span>;
      
      return (
        <Button variant="ghost" size="icon" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
          </a>
        </Button>
      )
    },
  },
]
