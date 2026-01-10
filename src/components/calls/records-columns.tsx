
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const formatDuration = (seconds: number) => {
    if(isNaN(seconds) || seconds < 0) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

export const callRecordsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "call_id",
    header: "Call ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === 'answered' ? 'success' : 'secondary'} className="capitalize">{row.getValue("status")}</Badge>
    ),
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
