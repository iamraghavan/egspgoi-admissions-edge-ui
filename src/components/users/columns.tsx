
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { useParams } from "next/navigation";
import Link from "next/link";

const RoleBadge = ({ role }: { role: Role }) => {
    const variant: "default" | "secondary" | "destructive" | "outline" =
        role === "Super Admin" ? "destructive"
        : role === "Admission Manager" ? "default"
        : role === "Marketing Manager" ? "default"
        : role === "Finance" ? "secondary"
        : "outline";
    
    return <Badge variant={variant} className="capitalize">{role}</Badge>
};

const StatusIndicator = ({ status }: { status?: string }) => {
    const isActive = status === 'active';
    return (
        <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="capitalize">{status}</span>
        </div>
    )
}

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-sm text-muted-foreground">{row.original.designation || row.original.email}</span>
            </div>
        )
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.original.role} />
    },
    {
        accessorKey: "smartflo",
        header: "Smartflo",
        cell: ({ row }) => (
            <div className="flex flex-col">
                 {row.original.agent_number && <span className="text-sm">Agent: {row.original.agent_number}</span>}
                 {row.original.caller_id && <span className="text-xs text-muted-foreground">Caller ID: {row.original.caller_id}</span>}
                 {!row.original.agent_number && !row.original.caller_id && <span className="text-xs text-muted-foreground">N/A</span>}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusIndicator status={(row.original as any).status} />
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const user = row.original;
            const meta = table.options.meta as { onEdit: (user: User) => void; onDelete: (userId: string, type: 'soft' | 'hard') => void; };
            const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string };
            
            const [isConfirmHardDeleteOpen, setConfirmHardDeleteOpen] = useState(false);

            const handleDelete = (type: 'soft' | 'hard') => {
                if (type === 'hard') {
                    setConfirmHardDeleteOpen(true);
                } else {
                    meta.onDelete(user.id, 'soft');
                }
            };
            
            const confirmHardDelete = () => {
                meta.onDelete(user.id, 'hard');
                setConfirmHardDeleteOpen(false);
            };

            return (
                <>
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
                            <Link href={`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/user-management/${user.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => meta.onEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleDelete('soft')}>
                                    Deactivate User (Soft)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete('hard')} className="text-destructive">
                                    Permanent Delete
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ConfirmationDialog
                    isOpen={isConfirmHardDeleteOpen}
                    onOpenChange={setConfirmHardDeleteOpen}
                    onConfirm={confirmHardDelete}
                    title="Confirm Permanent Deletion"
                    description={`Are you sure you want to permanently delete the user ${user.name}? This action is irreversible.`}
                    confirmText="Permanently Delete"
                />
                </>
            );
        }
    }
];
