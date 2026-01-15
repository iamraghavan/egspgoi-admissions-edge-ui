
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Lead, User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Phone, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useEffect, useState } from "react"
import { getUsers, deleteLead, getUserById, updateLeadStatus, initiateCall } from "@/lib/data"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { format } from 'date-fns';
import type { LeadStatus } from "@/lib/types";
import { CallStatusDialog } from "../calls/call-status-dialog"
import { ConfirmationDialog } from "../ui/confirmation-dialog"

const AssignedToCell = ({ row }: { row: any }) => {
    const lead = row.original as Lead;
    const user = lead.assigned_user;

    if (!user) {
        return <Badge variant="outline">Unassigned</Badge>;
    }

    return (
        <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
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
    accessorKey: "assigned_user",
    header: "Assigned To",
    cell: AssignedToCell,
  },
    {
    accessorKey: "district",
    header: "District",
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
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row, table }) => {
      const lead = row.original
      const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string };
      const { toast } = useToast();
      const [isCallDialogOpen, setCallDialogOpen] = useState(false);
      const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
      const [uniqueCallId, setUniqueCallId] = useState<string | null>(null);
      const [isConfirmHardDeleteOpen, setConfirmHardDeleteOpen] = useState(false);

      const handleUpdateStatus = async (status: LeadStatus) => {
        try {
            await updateLeadStatus(lead.id, status);
            toast({
                title: "Status Updated",
                description: `${lead.name}'s status updated to ${status}.`,
            });
            // This is a way to trigger a re-fetch in the parent component
            (table.options.meta as any)?.refreshData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Status Update Failed",
                description: error.message,
            });
        }
      }

      const handleCallClick = async () => {
        setSelectedLeadForCall(lead);
        try {
            const ref_id = await initiateCall(lead.id);
            setUniqueCallId(ref_id);
            setCallDialogOpen(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Call Failed', description: error.message });
            setSelectedLeadForCall(null);
        }
      };

      const handleDelete = async (type: 'soft' | 'hard') => {
        if (type === 'hard') {
            setConfirmHardDeleteOpen(true);
            return;
        }

        try {
            await deleteLead(lead.id, type);
            toast({
                title: "Lead Deleted",
                description: `${lead.name} has been soft deleted.`,
            });
            (table.options.meta as any)?.refreshData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message,
            });
        }
      };

      const confirmHardDelete = async () => {
         try {
            await deleteLead(lead.id, 'hard');
            toast({
                title: "Lead Permanently Deleted",
                description: `${lead.name} has been permanently deleted.`,
            });
            (table.options.meta as any)?.refreshData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message,
            });
        }
      }

      const leadStatuses: LeadStatus[] = ["New", "Contacted", "Interested", "Enrolled", "Failed"];

      return (
        <>
            <div className="flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/leads/${lead.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                    </Link>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.email)}>
                    Copy email address
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            Update Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {leadStatuses.map(status => (
                                <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(status)}>
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={handleCallClick}>
                        <Phone className="mr-2 h-4 w-4" />
                        Initiate Call
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleDelete('soft')}>
                                Soft Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete('hard')} className="text-destructive">
                                Hard Delete (Permanent)
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
             <CallStatusDialog
                isOpen={isCallDialogOpen}
                onOpenChange={setCallDialogOpen}
                lead={selectedLeadForCall}
                uniqueCallId={uniqueCallId}
            />
            <ConfirmationDialog
                isOpen={isConfirmHardDeleteOpen}
                onOpenChange={setConfirmHardDeleteOpen}
                onConfirm={confirmHardDelete}
                title="Confirm Permanent Deletion"
                description={`Are you sure you want to permanently delete the lead for ${lead.name}? This action cannot be undone.`}
                confirmText="Permanently Delete"
            />
        </>
      )
    },
  },
]
