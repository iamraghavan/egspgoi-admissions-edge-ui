
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

type DropdownRangeDatePickerProps = {
  selected?: DateRange;
  onSelect?: (range?: DateRange) => void;
  className?: string;
};

function DropdownRangeDatePicker({ selected, onSelect, className }: DropdownRangeDatePickerProps) {
  const today = new Date();
  const [month, setMonth] = React.useState(selected?.from?.getMonth() ?? today.getMonth());
  const [year, setYear] = React.useState(selected?.from?.getFullYear() ?? today.getFullYear());
  const [isOpen, setIsOpen] = React.useState(false);

  const displayMonth = new Date(year, month, 1);

  const formattedValue = selected?.from
    ? selected.to
      ? `${format(selected.from, "LLL dd, y")} - ${format(selected.to, "LLL dd, y")}`
      : format(selected.from, "LLL dd, y")
    : "Select date range";
    
  const handleSelect = (range?: DateRange) => {
    if(onSelect) {
      onSelect(range);
    }
  }
  
  const handleClear = () => {
    if (onSelect) {
      onSelect(undefined);
    }
  }

  React.useEffect(() => {
    if (selected?.from) {
      setMonth(selected.from.getMonth());
      setYear(selected.from.getFullYear());
    }
  }, [selected]);


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8 border-dashed",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate overflow-hidden">{formattedValue}</span>
           {selected && (
            <X className="ml-auto h-4 w-4" onClick={(e) => {
                e.stopPropagation();
                handleClear();
            }}/>
           )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={year.toString()}
              onValueChange={(val) => setYear(Number(val))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(
                  (y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={month.toString()}
              onValueChange={(val) => setMonth(Number(val))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(2000, i, 1), "MMMM")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            month={displayMonth}
            onMonthChange={(date) => {
              setMonth(date.getMonth());
              setYear(date.getFullYear());
            }}
            className="rounded-md border"
            numberOfMonths={2}
          />

           <div className="flex justify-end pt-2">
            <PopoverClose asChild>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DropdownRangeDatePicker };
