
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAdmissionManagerStats } from '@/lib/data';
import type { AdmissionManagerDashboardData, LeaderboardEntry, ChartPoint } from '@/lib/types';
import { Users, UserPlus, Target, Percent, LineChart, PieChart as PieChartIcon, Trophy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart as RechartsLineChart, XAxis, YAxis, Tooltip, Legend, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value?: number | string, icon: React.ElementType, loading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-8 w-20" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8442ff', '#ff42c8'];

export default function AdmissionDashboard() {
  const [stats, setStats] = useState<AdmissionManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedStats = await getAdmissionManagerStats();
        setStats(fetchedStats);
    } catch(err: any) {
         toast({
            variant: 'destructive',
            title: 'Failed to load dashboard data',
            description: err.message
        });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpis = stats?.kpi;
  const leaderboard = stats?.leaderboard || [];
  
  const sourceData = stats?.source_breakdown ? 
    Object.entries(stats.source_breakdown).map(([name, value]) => ({ name, value })) : [];

  const performanceChartData = stats?.charts.daily_leads.map(leadEntry => {
      const conversionEntry = stats.charts.daily_conversions.find(c => c.date === leadEntry.date);
      return {
          date: leadEntry.date,
          leads: leadEntry.value,
          conversions: conversionEntry?.value || 0
      }
  }) || [];

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Unassigned Leads" value={kpis?.unassigned_leads.value} icon={UserPlus} loading={loading} />
            <StatCard title="Total New Leads" value={kpis?.total_leads_period.value} icon={Users} loading={loading} />
            <StatCard title="Total Conversions" value={kpis?.conversions_period.value} icon={Target} loading={loading} />
            <StatCard title="Conversion Rate" value={`${kpis?.conversion_rate.value || 0}%`} icon={Percent} loading={loading} />
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Team Leaderboard</CardTitle>
            <CardDescription>Performance comparison of admission executives.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent Name</TableHead>
                            <TableHead className="text-right">Leads Assigned</TableHead>
                            <TableHead className="text-right">Converted</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard.map(agent => (
                            <TableRow key={agent.id}>
                                <TableCell className="font-medium">{agent.name}</TableCell>
                                <TableCell className="text-right">{agent.leads}</TableCell>
                                <TableCell className="text-right">{agent.conversions}</TableCell>
                                <TableCell className="text-right font-semibold">{agent.conversionRate}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Lead Source Breakdown</CardTitle>
                <CardDescription>Where your leads are coming from.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? <Skeleton className="h-64 w-full" /> : (
                    <ChartContainer config={{}} className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Tooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                 )}
            </CardContent>
        </Card>
      </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" /> Performance Trend</CardTitle>
                <CardDescription>Daily leads vs. conversions over the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? <Skeleton className="h-80 w-full" /> : (
                    <ChartContainer config={{
                        leads: { label: 'Leads', color: 'hsl(var(--chart-1))' },
                        conversions: { label: 'Conversions', color: 'hsl(var(--chart-2))' },
                    }} className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                           <RechartsLineChart data={performanceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(5)} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                <Legend />
                                <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="conversions" stroke="var(--color-conversions)" strokeWidth={2} dot={false} />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
