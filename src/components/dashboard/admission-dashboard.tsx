
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getLeads } from '@/lib/data';
import type { Lead } from '@/lib/types';
import StatsGrid from './stats-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const GanttChart = dynamic(() => import('@/components/gantt/gantt-chart').then(mod => mod.GanttChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});

export default function AdmissionDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const { encryptedUserId, role } = params as { encryptedUserId: string; role: string };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
        const { leads: fetchedLeads, error } = await getLeads();
        if(error) {
            toast({
                variant: 'destructive',
                title: 'Failed to load leads',
                description: error.message
            });
        } else {
            setLeads(fetchedLeads);
        }
    } catch(err: any) {
         toast({
            variant: 'destructive',
            title: 'Failed to load leads',
            description: err.message
        });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const recentLeads = leads.slice(0, 5);

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
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Leads</CardTitle>
                </div>
                 <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href={`/u/app/${role}/${encryptedUserId}/leads`}>
                        View All <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className='text-right'>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24 mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <Skeleton className="h-6 w-16" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : recentLeads.length > 0 ? (
                            recentLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell>
                                        <div className="font-medium">{lead.name}</div>
                                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <Badge variant="outline" className='capitalize'>{lead.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    No recent leads found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
