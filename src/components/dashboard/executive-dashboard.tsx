'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getProfile } from '@/lib/auth';
import type { User, Lead } from '@/lib/types';
import { getLeads, getCallRecords } from '@/lib/data';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Phone, Users, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useParams } from 'next/navigation';

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value?: number | string, icon: React.ElementType, loading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-8 w-20 mb-1" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);


export default function ExecutiveDashboard() {
  const [stats, setStats] = useState({ pendingFollowUps: 0, callsToday: 0, conversions: 0 });
  const [todaysLeads, setTodaysLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const { encryptedUserId, role } = params as { encryptedUserId: string; role: string };

  useEffect(() => {
    const fetchExecutiveData = async () => {
      setLoading(true);
      try {
        const profile = await getProfile();
        if (!profile) throw new Error("Could not fetch profile");

        const today = new Date();
        const callParams = {
            from_date: format(startOfDay(today), 'yyyy-MM-dd HH:mm:ss'),
            to_date: format(endOfDay(today), 'yyyy-MM-dd HH:mm:ss'),
            agent_number: profile.agent_number || undefined,
        };
        const callsResponse = await getCallRecords(callParams);
        const callsToday = callsResponse.count || 0;

        const { leads, error } = await getLeads({ assignedTo: profile.id });
        if(error) throw new Error(error.message || "Failed to fetch leads");
        
        const conversions = leads.filter(l => l.status === 'Enrolled').length; // Simple count for now
        const pendingFollowUps = 10; // Mock data as per instructions
        const todaysLeadsData = leads.slice(0, 5); // Just show recent leads for now.

        setStats({ pendingFollowUps, callsToday, conversions });
        setTodaysLeads(todaysLeadsData);

      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load dashboard data',
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExecutiveData();
  }, [toast]);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pending Follow-ups"
          value={stats.pendingFollowUps}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Total Calls Today"
          value={stats.callsToday}
          icon={Phone}
          loading={loading}
        />
        <StatCard
          title="My Conversions (All Time)"
          value={stats.conversions}
          icon={CheckCircle}
          loading={loading}
        />
      </div>

      {/* Today's Work List */}
      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Today's Work</CardTitle>
                <CardDescription>Your prioritized list of leads for today.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href={`/u/app/${role}/${encryptedUserId}/leads`}>
                    View All Leads <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Contacted</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell colSpan={3}>
                                    <Skeleton className="h-5 w-full" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : todaysLeads.length > 0 ? (
                        todaysLeads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className='capitalize'>{lead.status}</Badge>
                                </TableCell>
                                 <TableCell>
                                    {format(new Date(lead.last_contacted_at), "PP")}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No leads to display.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {/* Other Widgets can be added here later */}

    </div>
  );
}
