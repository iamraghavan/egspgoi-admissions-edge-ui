
import { atom } from 'jotai';

export type GanttScale = 'day' | 'week' | 'month';

export const ganttStartDateAtom = atom(new Date());
export const ganttScaleAtom = atom<GanttScale>('week');
