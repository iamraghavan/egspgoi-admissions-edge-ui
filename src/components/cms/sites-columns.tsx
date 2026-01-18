
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Site } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

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
        accessorKey: "api_key",
        header: "API Key",
        cell: ({ row }) => <code className="text-xs">{row.original.api_key}</code>
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
