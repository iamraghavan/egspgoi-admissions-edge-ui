
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
  searchKey?: string;
  searchPlaceholder?: string;
  onCreateLead?: () => void;
  onUploadLeads?: () => void;
  onBulkTransfer?: () => void;
  hideFilters?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  onCreateLead,
  onUploadLeads,
  onBulkTransfer,
  hideFilters = false,
}: DataTableToolbarProps<TData>) {

  const isFiltered = table.getState().columnFilters.length > 0
  const isRowSelected = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
      <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-2">
        {searchKey && (
            <Input
            placeholder={searchPlaceholder || `Filter by ${searchKey}...`}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-full md:w-[150px] lg:w-[250px]"
            />
        )}
        {!hideFilters && (
          <div className="flex items-center gap-2">
            {table.getColumn("status") && searchKey && (
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
        )}
      </div>
      <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center justify-end gap-2">
         {isRowSelected && onBulkTransfer && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto">
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
         {onUploadLeads && (
            <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto" onClick={onUploadLeads}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
            </Button>
         )}
        {onCreateLead && (
            <Button size="sm" className="h-8 w-full sm:w-auto" onClick={onCreateLead}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Lead
            </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
