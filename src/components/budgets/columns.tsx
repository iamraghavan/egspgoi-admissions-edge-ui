
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BudgetRequest } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/formatters"
import { format } from "date-fns"


export const budgetColumns: ColumnDef<BudgetRequest>[] = [
  {
    accessorKey: "campaign_name",
    header: "Campaign",
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
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={
            row.getValue("status") === "approved" ? "success" 
            : row.getValue("status") === "rejected" ? "destructive" 
            : "secondary"
        } 
        className="capitalize"
    >
        {row.getValue("status")}
    </Badge>
    ),
  },
  {
    accessorKey: "submitted_by",
    header: "Submitted By",
    cell: ({ row }) => {
        const submittedBy = row.original.submitted_by_user;
        return <span>{submittedBy?.name || '...'}</span>;
    },
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted At",
    cell: ({ row }) => {
      const submittedAt = row.getValue("submitted_at") as string | undefined;
      if (!submittedAt) return null;
      try {
        const date = new Date(submittedAt);
        return <div>{format(date, "PPP")}</div>
      } catch {
        return <div>Invalid Date</div>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const request = row.original
      const meta = table.options.meta as any;

      if (request.status !== "pending") return null;

      return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => meta.onApprove(request.id)}>
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Approve</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => meta.onReject(request.id)}>
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
