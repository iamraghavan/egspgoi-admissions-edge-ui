
"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { statuses } from "./data-table-faceted-filter"
import { X, PlusCircle, Upload, Users, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DateRangePicker } from 'react-date-range';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"


interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string;
  searchPlaceholder?: string;
  onCreateLead?: () => void;
  onUploadLeads?: () => void;
  onBulkTransfer?: () => void;
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange?: DateRange) => void;
  onSearch?: (filters: { dateRange?: DateRange }) => void;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  onCreateLead,
  onUploadLeads,
  onBulkTransfer,
  dateRange,
  onDateRangeChange,
  onSearch,
}: DataTableToolbarProps<TData>) {

  const handleDateChange = (ranges: any) => {
    if (onDateRangeChange) {
        const { selection } = ranges;
        const newRange = { from: selection.startDate, to: selection.endDate };
        onDateRangeChange(newRange);
    }
  }

  const isFiltered = table.getState().columnFilters.length > 0 || !!dateRange;
  const isRowSelected = table.getFilteredSelectedRowModel().rows.length > 0;
  
  const resetFilters = () => {
    table.resetColumnFilters();
    if(onDateRangeChange) onDateRangeChange(undefined);
    if(onSearch) onSearch({});
  }
  
  const handleSearchClick = () => {
    if(onSearch) onSearch({ dateRange });
  }

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
        <div className="flex items-center gap-2">
            {table.getColumn("status") && (
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={statuses}
              />
            )}
            {onDateRangeChange && (
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="sm"
                        className={cn(
                        "h-8 w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <DateRangePicker
                        onChange={handleDateChange}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={[{
                            startDate: dateRange?.from,
                            endDate: dateRange?.to,
                            key: 'selection'
                        }]}
                        direction="horizontal"
                    />
                </PopoverContent>
                </Popover>
            )}
            {onSearch && (
                <Button onClick={handleSearchClick} size="sm" className="h-8">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            )}
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
        </div>
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
