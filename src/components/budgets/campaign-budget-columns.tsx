
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BudgetRequest } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { format } from "date-fns"

export const campaignBudgetColumns: ColumnDef<BudgetRequest>[] = [
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
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'approved' ? 'success'
                      : status === 'rejected' ? 'destructive'
                      : 'secondary';
      return (
      <Badge variant={variant} className="capitalize">
        {status}
    </Badge>
    )},
  },
  {
    accessorKey: "submitted_by_user.name",
    header: "Submitted By",
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted At",
    cell: ({ row }) => {
      const submittedAt = row.getValue("submitted_at") as string | undefined;
      if (!submittedAt) return null;
      try {
        const date = new Date(submittedAt);
        return <div>{format(date, "PP")}</div>
      } catch {
        return <div>Invalid Date</div>
      }
    },
  },
]
