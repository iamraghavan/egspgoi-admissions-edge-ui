
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
} from 'date-fns';
import { useAtom } from 'jotai';
import { ganttStartDateAtom, ganttScaleAtom, GanttScale } from './atoms';
import throttle from 'lodash.throttle';
import { Lead } from '@/lib/types';

const getScaleConfig = (scale: GanttScale) => {
  switch (scale) {
    case 'week':
      return {
        getIntervals: eachWeekOfInterval,
        getLabel: (d: Date) => `Week of ${format(d, 'MMM d')}`,
        getSecondaryLabel: (d: Date) => format(d, 'd'),
        getSecondaryIntervals: eachDayOfInterval,
        add: addWeeks,
        columnWidth: 70,
        totalColumns: 20,
      };
    case 'month':
      return {
        getIntervals: eachMonthOfInterval,
        getLabel: (d: Date) => format(d, 'MMMM yyyy'),
        getSecondaryLabel: (d: Date) => `W${format(d, 'w')}`,
        getSecondaryIntervals: (interval: {start:Date, end: Date}) => eachWeekOfInterval(interval, { weekStartsOn: 1}),
        add: addMonths,
        columnWidth: 200,
        totalColumns: 12,
      };
    case 'day':
    default:
      return {
        getIntervals: eachDayOfInterval,
        getLabel: (d: Date) => format(d, 'EEE, MMM d'),
        getSecondaryLabel: (d: Date) => format(d, 'HH:mm'),
        getSecondaryIntervals: () => [], // No secondary for day view
        add: addDays,
        columnWidth: 100,
        totalColumns: 30,
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

    const primaryHeaders = config.getIntervals(interval).map((day) => ({
      label: config.getLabel(day),
      width: config.columnWidth,
    }));
    
    let secondaryHeaders: {label: string, width: number}[] = [];
    if (scale === 'week') {
        const days = eachDayOfInterval(interval);
        secondaryHeaders = days.map(d => ({ label: format(d, 'd'), width: config.columnWidth / 7 }))
    } else if (scale === 'month') {
        const weeks = eachWeekOfInterval(interval, { weekStartsOn: 1 });
        secondaryHeaders = weeks.map(w => ({ label: `W${format(w, 'w')}`, width: config.columnWidth / 4.3 }))
    }


    const totalWidth = primaryHeaders.reduce((acc, curr) => acc + curr.width, 0);

    const getPositionFromDate = (date: Date) => {
      const daysDiff = differenceInDays(startOfDay(date), startOfDay(startDate));
      let position;
      switch (scale) {
          case 'month':
             position = (daysDiff / 30.44) * config.columnWidth; // Average days in a month
             break;
          case 'week':
              position = (daysDiff / 7) * config.columnWidth;
              break;
          case 'day':
          default:
              position = daysDiff * config.columnWidth;
              break;
      }
      return Math.max(0, position);
    };

    const rangeLabel = `${format(startDate, 'MMMM yyyy')}`;

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
