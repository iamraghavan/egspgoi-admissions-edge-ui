
'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  differenceInDays,
  addDays,
  addWeeks,
  addMonths,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { useAtom } from 'jotai';
import { ganttStartDateAtom, ganttScaleAtom, GanttScale } from './atoms';
import throttle from 'lodash.throttle';
import { Lead } from '@/lib/types';

const getScaleConfig = (scale: GanttScale) => {
  switch (scale) {
    case 'week':
      return {
        getPrimaryIntervals: (interval: {start: Date, end: Date}) => eachWeekOfInterval(interval, { weekStartsOn: 1 }),
        getPrimaryLabel: (d: Date) => `Week of ${format(d, 'MMM d')}`,
        getSecondaryIntervals: (interval: {start: Date, end: Date}) => eachDayOfInterval(interval),
        getSecondaryLabel: (d: Date) => format(d, 'EEE d'),
        add: addWeeks,
        columnWidth: 280, // 40px per day
        totalColumns: 10,
        daysInColumn: 7,
      };
    case 'month':
      return {
        getPrimaryIntervals: eachMonthOfInterval,
        getPrimaryLabel: (d: Date) => format(d, 'MMMM yyyy'),
        getSecondaryIntervals: (interval: {start: Date, end: Date}) => eachWeekOfInterval(interval, { weekStartsOn: 1}),
        getSecondaryLabel: (d: Date) => `W${format(d, 'w')}`,
        add: addMonths,
        columnWidth: 400, // 100px per week
        totalColumns: 6,
        daysInColumn: 30.44, // average
      };
    case 'day':
    default:
      return {
        getPrimaryIntervals: eachDayOfInterval,
        getPrimaryLabel: (d: Date) => format(d, 'EEE, MMM d'),
        getSecondaryIntervals: () => [], // No secondary for day view
        getSecondaryLabel: (d: Date) => '',
        add: addDays,
        columnWidth: 100,
        totalColumns: 30,
        daysInColumn: 1,
      };
  }
};

export type Timeline = {
    headers: {
        primary: { label: string, width: number }[];
        secondary: { label: string, width: number }[];
    };
    totalWidth: number;
    rangeLabel: string;
    startDate: Date;
    endDate: Date;
    getPositionFromDate: (date: Date) => number;
}


export const useGantt = (leads: Lead[]) => {
  const [startDate, setStartDate] = useAtom(ganttStartDateAtom);
  const [scale] = useAtom(ganttScaleAtom);

  const timeline = useMemo((): Timeline => {
    const config = getScaleConfig(scale);
    const endDate = config.add(startDate, config.totalColumns);
    const interval = { start: startDate, end: endDate };

    const primaryHeaders = config.getPrimaryIntervals(interval).map((day) => ({
      label: config.getPrimaryLabel(day),
      width: config.columnWidth,
    }));
    
    let secondaryHeaders: {label: string, width: number}[] = [];
    
    if (scale === 'week') {
        const days = config.getSecondaryIntervals(interval);
        secondaryHeaders = days.map(d => ({ label: config.getSecondaryLabel(d), width: config.columnWidth / config.daysInColumn }))
    } else if (scale === 'month') {
        const primaryIntervals = config.getPrimaryIntervals(interval);
        primaryIntervals.forEach(monthStart => {
            const monthEnd = endOfMonth(monthStart);
            const weeksInMonth = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
            weeksInMonth.forEach(weekStart => {
                secondaryHeaders.push({ label: config.getSecondaryLabel(weekStart), width: config.columnWidth / weeksInMonth.length });
            });
        });
    }

    const totalWidth = primaryHeaders.reduce((acc, curr) => acc + curr.width, 0);

    const getPositionFromDate = (date: Date) => {
      const daysDiff = differenceInDays(startOfDay(date), startOfDay(startDate));
      const position = (daysDiff / config.daysInColumn) * config.columnWidth;
      return Math.max(0, position);
    };

    let rangeLabel = format(startDate, 'MMMM yyyy');
    if (scale === 'day') {
        rangeLabel = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (scale === 'week') {
        rangeLabel = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }


    return {
      headers: { primary: primaryHeaders, secondary: secondaryHeaders },
      totalWidth,
      rangeLabel,
      startDate,
      endDate,
      getPositionFromDate,
    };
  }, [startDate, scale]);


  // --- Pan and Zoom ---
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (gridRef.current) {
      gridRef.current.scrollLeft += e.deltaY;
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (gridRef.current) {
        setIsDragging(true);
        setDragStart({ x: e.pageX, scrollLeft: gridRef.current.scrollLeft });
    }
  };

  const handleMouseMoveThrottled = useCallback(
    throttle((e: MouseEvent) => {
      if (!isDragging || !gridRef.current) return;
      const x = e.pageX;
      const walk = (x - dragStart.x) * 2; // The multiplier increases scroll speed
      gridRef.current.scrollLeft = dragStart.scrollLeft - walk;
    }, 16), // ~60fps
    [isDragging, dragStart]
  );
  
  const handleMouseMove = (e: React.MouseEvent) => {
      handleMouseMoveThrottled(e.nativeEvent);
  }

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const goToPrevious = () => {
      const config = getScaleConfig(scale);
      setStartDate(config.add(startDate, -1));
  }

  const goToNext = () => {
      const config = getScaleConfig(scale);
      setStartDate(config.add(startDate, 1));
  }
  
  const goToToday = () => {
      setStartDate(new Date());
  }


  return {
    timeline,
    gridRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    goToNext,
    goToPrevious,
    goToToday,
  };
};
