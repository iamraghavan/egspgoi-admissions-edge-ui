
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PaymentRecord } from "@/lib/types"
import { getLeadById } from "@/lib/data"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"
import { formatCurrency } from "@/lib/formatters"

const LeadCell = ({ row }: { row: any }) => {
    const payment = row.original as PaymentRecord;
    const [leadName, setLeadName] = useState<string>('');
    
    useEffect(() => {
        getLeadById(payment.leadId).then(lead => {
            if (lead) {
                setLeadName(lead.name);
            }
        });
    }, [payment.leadId]);

    if (!leadName) return <div className="h-6 w-24 animate-pulse bg-muted rounded-md" />;

    return <span>{leadName}</span>
}

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
        cell: LeadCell
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
