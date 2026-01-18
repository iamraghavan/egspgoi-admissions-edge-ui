
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Site } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { Badge } from "../ui/badge";

const StatusBadge = ({ site, onVerifyClick }: { site: Site, onVerifyClick: (site: Site) => void }) => {
    const status = site.status;

    switch (status) {
        case 'verified':
        case 'active':
            return (
                <Badge variant="success">
                    <CheckCircle2 className="mr-2 h-3 w-3" />
                    Verified
                </Badge>
            );
        case 'pending':
            return (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-auto py-0.5 px-2 border-dashed border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                    onClick={() => onVerifyClick(site)}
                >
                    <Clock className="mr-2 h-3 w-3" />
                    Pending Verification
                </Button>
            );
        case 'failed':
             return (
                <Badge variant="destructive">
                    <XCircle className="mr-2 h-3 w-3" />
                    Failed
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}


export const siteColumns: ColumnDef<Site>[] = [
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
                <a href={`http://${row.original.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
                    {row.original.domain}
                </a>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Verification Status",
        cell: ({ row, table }) => {
            const meta = table.options.meta as { onVerify: (site: Site) => void; };
            return <StatusBadge site={row.original} onVerifyClick={meta.onVerify} />
        }
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => format(new Date(row.original.created_at), "PP"),
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const site = row.original;
            const meta = table.options.meta as { onEdit: (site: Site) => void; onDelete: (site: Site) => void; };

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
                        <DropdownMenuItem onClick={() => meta.onEdit(site)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Site
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => meta.onDelete(site)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];
