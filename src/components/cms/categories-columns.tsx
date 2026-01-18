"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";

export const categoriesColumns: ColumnDef<Category>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="font-medium">{row.original.name}</div>
        )
    },
    {
        accessorKey: "slug",
        header: "Slug",
    },
    {
        accessorKey: "show_on_menu",
        header: "On Menu",
        cell: ({ row }) => {
            const show = row.original.show_on_menu;
            return show ? (
                <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Yes
                </Badge>
            ) : (
                <Badge variant="secondary">
                     <XCircle className="mr-1 h-3 w-3" />
                    No
                </Badge>
            )
        }
    },
    {
        accessorKey: "order",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Order
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.original.order}</div>
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const category = row.original;
            const meta = table.options.meta as { onEdit: (category: Category) => void; onDelete: (category: Category) => void; };

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
                        <DropdownMenuItem onClick={() => meta.onEdit(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => meta.onDelete(category)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];
