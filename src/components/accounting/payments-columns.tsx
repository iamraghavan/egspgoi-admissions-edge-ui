
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PaymentRecord } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"
import { formatCurrency } from "@/lib/formatters"
import { format } from "date-fns"

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
          const dateString = row.getValue("date") as string;
          if (!dateString) return null;
          const date = new Date(dateString)
          return <div>{format(date, "PPP")}</div>
        },
    },
    {
        accessorKey: "purpose",
        header: "Purpose",
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
        accessorKey: "payment_method",
        header: "Method",
    },
     {
        accessorKey: "transaction_id",
        header: "Transaction ID",
    },
    {
        accessorKey: "transfer_by",
        header: "Transferred By",
    },
]
