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

export const callHistoryColumns: ColumnDef<any>[] = [
  {
    accessorKey: "date",
    header: "Date & Time",
     cell: ({ row }) => {
      const date = new Date(`${row.original.date}T${row.original.time}Z`);
      return <div>{date.toLocaleString()}</div>;
    },
  },
   {
    accessorKey: "call_id",
    header: "Call ID",
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
    accessorKey: "direction",
    header: "Direction",
     cell: ({ row }) => (
      <span className="capitalize">{row.getValue("direction")}</span>
    ),
  },
  {
    accessorKey: "call_duration",
    header: "Duration",
    cell: ({ row }) => formatDuration(row.getValue("call_duration")),
  },
  {
    accessorKey: "recording_url",
    header: "Recording",
    cell: ({ row }) => {
      const call = row.original

      return (
        <Button variant="ghost" size="icon" asChild>
          <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-5 w-5 text-muted-foreground" />
          </a>
        </Button>
      )
    },
  },
]
