"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Call, User, Lead } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, PlayCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { getLeadById, getUserById } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const DataCell = ({ id, fetcher, nameKey, avatarKey }: { id: string; fetcher: (id: string) => Promise<any>; nameKey: string; avatarKey?: string }) => {
    const [data, setData] = useState<any>(null);
    
    useEffect(() => {
        fetcher(id).then(setData);
    }, [id, fetcher]);

    if (!data) return <div className="h-10 w-24 animate-pulse bg-muted rounded-md" />;

    return (
        <div className="flex items-center gap-2">
            {avatarKey && data[avatarKey] && (
                <Avatar className="w-8 h-8">
                    <AvatarImage src={data[avatarKey]} alt={data[nameKey]} />
                    <AvatarFallback>{data[nameKey].charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <span>{data[nameKey]}</span>
        </div>
    )
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

export const callHistoryColumns: ColumnDef<Call>[] = [
  {
    accessorKey: "leadId",
    header: "Lead",
    cell: ({ row }) => <DataCell id={row.original.leadId} fetcher={getLeadById} nameKey="name" />,
  },
  {
    accessorKey: "agentId",
    header: "Agent",
    cell: ({ row }) => <DataCell id={row.original.agentId} fetcher={getUserById} nameKey="name" avatarKey="avatarUrl" />,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"))
      return <div>{date.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => formatDuration(row.getValue("duration")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const call = row.original

      return (
        <Button variant="ghost" size="icon" asChild>
          <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
          </a>
        </Button>
      )
    },
  },
]
