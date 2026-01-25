
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Campaign, CampaignStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatCurrency } from "@/lib/formatters"

const getStatusVariant = (status: CampaignStatus) => {
    switch (status) {
        case 'active': return 'success';
        case 'draft': return 'secondary';
        case 'paused': return 'warning';
        case 'completed': return 'outline';
        default: return 'secondary';
    }
}

export const campaignColumns: ColumnDef<Campaign>[] = [
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
        const campaign = row.original;
        const params = useParams() as { role: string; encryptedUserId: string };
        const campaignUrl = `/u/app/${params.role}/${params.encryptedUserId}/campaigns/${campaign.id}`;
        return (
            <Link href={campaignUrl} className="font-medium text-primary hover:underline">
                {campaign.name}
            </Link>
        )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.getValue("status"))} className="capitalize">{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.getValue("start_date")), "LLL dd, y"),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => format(new Date(row.getValue("end_date")), "LLL dd, y"),
  },
  {
    accessorKey: "budget",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("budget"))
 
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const campaign = row.original
      const params = useParams() as { role: string; encryptedUserId: string };
      const meta = table.options.meta as { onDelete: (campaign: Campaign) => void; };

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
                <Link href={`/u/app/${params.role}/${params.encryptedUserId}/campaigns/${campaign.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => meta.onDelete(campaign)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
