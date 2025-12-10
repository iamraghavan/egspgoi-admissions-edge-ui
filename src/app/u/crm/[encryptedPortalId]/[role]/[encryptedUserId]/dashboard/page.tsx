'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/page-header';
import StatsGrid from '@/components/dashboard/stats-grid';
import LeadsChart from '@/components/dashboard/leads-chart';
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
import { ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage({ params }: { params: { encryptedPortalId: string; encryptedUserId: string; role: string } }) {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { encryptedPortalId, encryptedUserId, role } = params;

  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        setLoading(true);
        const allLeads = await getLeads();
        setRecentLeads(allLeads.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recent leads", error);
        // Optionally, show a toast notification
      } finally {
        setLoading(false);
      }
    };
    fetchRecentLeads();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" />
      <StatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsChart />
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Leads</CardTitle>
                </div>
                 <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href={`/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/leads`}>
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
    </div>
  );
}
