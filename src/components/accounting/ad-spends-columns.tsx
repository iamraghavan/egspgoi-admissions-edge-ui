
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
    accessorKey: "campaign_name",
    header: "Campaign",
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("platform")}</Badge>
    ),
  },
  {
    accessorKey: "budget_allocated",
    header: "Budget Allocated",
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("budget_allocated"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "actual_spend",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          Actual Spend
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("actual_spend"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
]
