
"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { statuses } from "./data-table-faceted-filter"
import { X, PlusCircle, Upload, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onCreateLead: () => void;
  onUploadLeads: () => void;
  onBulkTransfer: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onCreateLead,
  onUploadLeads,
  onBulkTransfer
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const isRowSelected = table.getFilteredSelectedRowModel().rows.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter leads by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
         {isRowSelected && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    Bulk Actions
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    {table.getFilteredSelectedRowModel().rows.length} lead(s) selected
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onBulkTransfer}>
                    <Users className="mr-2 h-4 w-4" />
                    Transfer Leads
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
         )}
         <Button variant="outline" size="sm" className="h-8" onClick={onUploadLeads}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
        </Button>
        <Button size="sm" className="h-8" onClick={onCreateLead}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Lead
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
