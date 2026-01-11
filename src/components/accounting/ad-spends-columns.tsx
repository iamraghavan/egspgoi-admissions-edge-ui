
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AdSpend } from "@/lib/types"
import { Badge } from "../ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"
import { formatCurrency } from "@/lib/formatters"

export const adSpendsColumns: ColumnDef<AdSpend>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "campaignId",
    header: "Campaign",
    cell: ({ row }) => {
        const adSpend = row.original as AdSpend;
        return <span>{adSpend.campaignName || 'N/A'}</span>
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("platform")}</Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
]
