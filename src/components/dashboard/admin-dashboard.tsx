
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StatsGrid from '@/components/dashboard/stats-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLeads } from '@/lib/data';
import type { Lead } from '@/lib/types';
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
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const LeadsChart = dynamic(() => import('@/components/dashboard/leads-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px]" />,
});

export default function AdminDashboard() {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { encryptedUserId, role } = params as { encryptedUserId: string; role: string };
  const { toast } = useToast();


  useEffect(() => {
    const fetchRecentLeads = async () => {
      setLoading(true);
      try {
        const { leads: allLeads, error } = await getLeads();
        if (error) {
          toast({
              variant: "destructive",
              title: "Failed to fetch leads",
              description: error.message || "An unexpected error occurred.",
          });
        } else {
          setRecentLeads(allLeads.slice(0, 5));
        }
      } catch (err: any) {
         toast({
              variant: "destructive",
              title: "Failed to fetch leads",
              description: err.message || "An unexpected error occurred.",
          });
      } finally {
        setLoading(false);
      }
    };
    fetchRecentLeads();
  }, [toast]);

  return (
    <>
      <StatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsChart />
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Leads</CardTitle>
                </div>
                 <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href={`/u/portal/${role}/${encryptedUserId}/leads`}>
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
