
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getLeads } from '@/lib/data';
import type { Lead } from '@/lib/types';
import StatsGrid from './stats-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const KanbanBoard = dynamic(() => import('@/components/leads/kanban-board'), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});

const GanttChart = dynamic(() => import('@/components/gantt/gantt-chart').then(mod => mod.GanttChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});

export default function AdmissionDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { leads: fetchedLeads } = await getLeads();
    setLeads(fetchedLeads);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <StatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Lead Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart leads={leads} isLoading={loading} />
          </CardContent>
        </Card>
        <Card className="h-full">
           <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard leads={leads} isLoading={loading} onLeadUpdate={fetchDashboardData} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
