
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BadgeProps } from "@/components/ui/badge";

const formatDuration = (seconds: number) => {
    if(isNaN(seconds) || seconds < 0) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

const getStatusVariant = (status: string): BadgeProps['variant'] => {
    switch(status?.toLowerCase()) {
        case 'answered': return 'success';
        case 'missed': return 'destructive';
        case 'ringing': return 'warning';
        default: return 'secondary';
    }
}

export const callRecordsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "call_id",
    header: "Call ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusVariant(status)} className="capitalize">{status}</Badge>
      )
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
    accessorKey: "call_duration",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatDuration(row.getValue("call_duration")),
  },
  {
    accessorKey: "agent_name",
    header: "Agent",
  },
  {
    accessorKey: "customer_number",
    header: "Customer Number",
  },
  {
    accessorKey: "recording_url",
    header: "Recording",
    cell: ({ row, table }) => {
      const url = row.getValue("recording_url") as string;
      if (!url) return <span>N/A</span>;
      
      const { setPlayingRecording } = (table.options.meta || {}) as any;

      return (
        <Button variant="ghost" size="icon" onClick={() => setPlayingRecording?.(url)}>
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
      )
    },
  },
]
