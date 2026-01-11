
'use client';

import { useGantt } from './hooks';
import { TimelineHeader } from './timeline-header';
import { GanttRow } from './gantt-row';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAtom } from 'jotai';
import { ganttScaleAtom } from './atoms';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function GanttChart({ leads, isLoading }: { leads: Lead[], isLoading: boolean }) {
  const {
    timeline,
    gridRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    goToNext,
    goToPrevious,
    goToToday,
  } = useGantt(leads);

  const [scale, setScale] = useAtom(ganttScaleAtom);

  if (isLoading) {
      return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm">{timeline.rangeLabel}</span>
        </div>
        <div>
          <Select
            value={scale}
            onValueChange={(value) => setScale(value as 'day' | 'week' | 'month')}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      <div
        className="flex-grow overflow-auto cursor-grab active:cursor-grabbing"
        ref={gridRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ width: `${timeline.totalWidth}px` }} className="relative">
          <TimelineHeader timeline={timeline} />
          <div className="relative">
            {leads.map((lead, index) => (
              <GanttRow
                key={lead.id}
                lead={lead}
                timeline={timeline}
                isOdd={index % 2 !== 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
