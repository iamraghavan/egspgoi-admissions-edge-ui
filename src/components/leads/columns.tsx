
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Lead, User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Phone, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useEffect, useState } from "react"
import { getUsers, initiateCall, deleteLead, getUserById } from "@/lib/data"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { format } from 'date-fns';

const AssignedToCell = ({ row }: { row: any }) => {
    const lead = row.original as Lead;
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (lead.agent_id) {
            getUserById(lead.agent_id).then((data) => {
                if(data) setUser(data);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [lead.agent_id]);

    if (loading) {
         return <div className="h-10 w-24 animate-pulse bg-muted rounded-md" />;
    }

    if (!lead.agent_id || !user) {
        return <Badge variant="outline">Unassigned</Badge>;
    }

    return (
        <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
        </div>
    )
}

export const leadColumns: ColumnDef<Lead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const lead = row.original;
        return (
            <div className="flex flex-col">
                <span className="font-medium">{lead.name}</span>
                <span className="text-sm text-muted-foreground">{lead.email}</span>
            </div>
        )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "agent_id",
    header: "Assigned To",
    cell: AssignedToCell,
  },
  {
    accessorKey: "last_contacted_at",
    header: "Last Contacted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("last_contacted_at"))
      return <div>{format(date, "PPP")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const lead = row.original
      const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string };
      const { toast } = useToast();
      const [isCalling, setIsCalling] = useState(false);

      const handleCall = async () => {
        setIsCalling(true);
        try {
            await initiateCall(lead.id);
            toast({
                title: "Call Initiated",
                description: `Calling ${lead.name}...`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Call Failed",
                description: error.message,
            });
        } finally {
            setIsCalling(false);
        }
      };

      const handleDelete = async () => {
        try {
            await deleteLead(lead.id);
            toast({
                title: "Lead Deleted",
                description: `${lead.name} has been deleted.`,
            });
            // This is a way to trigger a re-fetch in the parent component
            (table.options.meta as any)?.refreshData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message,
            });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href={`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/leads/${lead.id}`}>
                    View lead details
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.email)}>
              Copy email address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCall} disabled={isCalling}>
              {isCalling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
              Initiate Call
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
