
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PaymentRecord } from "@/lib/types"
import { Badge } from "../ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"
import { formatCurrency } from "@/lib/formatters"

export const paymentsColumns: ColumnDef<PaymentRecord>[] = [
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
        accessorKey: "leadId",
        header: "Lead",
        cell: ({ row }) => {
            const payment = row.original as PaymentRecord;
            return <span>{payment.leadName || 'N/A'}</span>
        }
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
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">{row.getValue("status")}</Badge>
        ),
    },
    {
        accessorKey: "method",
        header: "Method",
    },
]
