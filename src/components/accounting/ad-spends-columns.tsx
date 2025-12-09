"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AdSpend } from "@/lib/types"
import { getCampaignById } from "@/lib/data"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"

const CampaignCell = ({ row }: { row: any }) => {
    const adSpend = row.original as AdSpend;
    const [campaignName, setCampaignName] = useState<string>('');
    
    useEffect(() => {
        getCampaignById(adSpend.campaignId).then(campaign => {
            if (campaign) {
                setCampaignName(campaign.name);
            }
        });
    }, [adSpend.campaignId]);

    if (!campaignName) return <div className="h-6 w-32 animate-pulse bg-muted rounded-md" />;

    return <span>{campaignName}</span>
}

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
    cell: CampaignCell,
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
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
