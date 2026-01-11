
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BudgetRequest, User, Campaign } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { getCampaignById, getUserById } from "@/lib/data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DataCell = ({ id, fetcher, nameKey }: { id: string; fetcher: (id: string) => Promise<any>; nameKey: string }) => {
    const [data, setData] = useState<any>(null);
    
    useEffect(() => {
        if (id) {
            fetcher(id).then(setData);
        }
    }, [id, fetcher, nameKey]);

    if (!data) return <div className="h-6 w-24 animate-pulse bg-muted rounded-md" />;

    return <span>{data[nameKey]}</span>
}


export const budgetColumns: ColumnDef<BudgetRequest>[] = [
  {
    accessorKey: "campaignId",
    header: "Campaign",
    cell: ({ row }) => <DataCell id={row.original.campaignId} fetcher={getCampaignById} nameKey="name" />,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={
            row.getValue("status") === "Approved" ? "default" 
            : row.getValue("status") === "Rejected" ? "destructive" 
            : "secondary"
        } 
        className="capitalize"
    >
        {row.getValue("status")}
    </Badge>
    ),
  },
  {
    accessorKey: "submittedBy",
    header: "Submitted By",
    cell: ({ row }) => <DataCell id={row.original.submittedBy} fetcher={getUserById} nameKey="name" />,
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("submittedAt"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original

      if (request.status !== "Pending") return null;

      return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Approve</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Reject</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
      )
    },
  },
]
