"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Lead, User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useEffect, useState } from "react"
import { getUsers } from "@/lib/data"

async function getAssignedToUser(userId: string) {
    const users = await getUsers();
    return users.find(u => u.id === userId);
}

const AssignedToCell = ({ row }: { row: any }) => {
    const lead = row.original as Lead;
    const [user, setUser] = useState<User | undefined>(undefined);
    
    useEffect(() => {
        getAssignedToUser(lead.assignedTo).then(setUser);
    }, [lead.assignedTo]);

    if (!user) return <div className="h-10 w-24 animate-pulse bg-muted rounded-md" />;

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
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: AssignedToCell,
  },
  {
    accessorKey: "lastContacted",
    header: "Last Contacted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastContacted"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(lead.email)}
            >
              Copy email address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a href={`tel:${lead.phone}`} className="flex items-center w-full">
                <Phone className="mr-2 h-4 w-4" />
                Call lead
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>View lead details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
