
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getExecutiveStats } from '@/lib/data';
import { format, subDays } from 'date-fns';
import { Users, CheckCircle, ListTodo, Calendar as CalendarIcon, Search, Percent } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Bar, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import type { AdmissionExecutiveDashboardData, AdmissionExecutiveTask } from '@/lib/types';

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
  const [stats, setStats] = useState<AdmissionExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const { encryptedUserId, role } = params as { encryptedUserId: string; role: string };
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const fetchExecutiveData = useCallback(async (range?: DateRange) => {
      setLoading(true);
      try {
        const startDate = range?.from ? format(range.from, 'yyyy-MM-dd') : undefined;
        const endDate = range?.to ? format(range.to, 'yyyy-MM-dd') : undefined;

        const response = await getExecutiveStats(undefined, startDate, endDate);
        
        if (response) {
            setStats(response);
        }

      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load dashboard data',
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
  }, [toast]);
  
  useEffect(() => {
    fetchExecutiveData(dateRange);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
      fetchExecutiveData(dateRange);
  }
  
  const kpis = stats?.kpi;
  const tasks = stats?.tasks || [];
  const charts = stats?.charts;

  const chartData = charts ? charts.daily_leads.map((leadItem) => {
    const conversionItem = charts.daily_conversions.find((convItem) => convItem.date === leadItem.date);
    return {
        date: leadItem.date,
        leads: leadItem.value,
        conversions: conversionItem ? conversionItem.value : 0,
    }
  }) : [];

  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-semibold">My Performance</h2>
                <p className="text-sm text-muted-foreground">Analytics for your activities in the selected range.</p>
            </div>
             <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                <Button onClick={handleSearch} disabled={loading}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </div>
        </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Leads (Period)"
          value={kpis?.total_leads?.value}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="My Conversions"
          value={kpis?.my_conversions?.value}
          icon={CheckCircle}
          loading={loading}
        />
        <StatCard
          title="Success Rate"
          value={kpis ? `${kpis.conversion_rate.value}%` : '...'}
          icon={Percent}
          loading={loading}
        />
        <StatCard
          title="Pending Tasks (Live)"
          value={kpis?.pending_followups?.value}
          icon={ListTodo}
          loading={loading}
        />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>Leads assigned vs. conversions over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-[300px]" /> : (
                    <ChartContainer config={{
                        leads: { label: 'Leads', color: 'hsl(var(--chart-1))' },
                        conversions: { label: 'Conversions', color: 'hsl(var(--chart-2))' },
                    }} className="h-[300px]">
                        <ComposedChart data={chartData}>
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(5)} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Legend />
                            <Bar dataKey="conversions" fill="var(--color-conversions)" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>

        {/* Today's Work List */}
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Today's Tasks</CardTitle>
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
                            <TableHead>Lead</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Due Date</TableHead>
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
                        ) : tasks.length > 0 ? (
                            tasks.map((task: AdmissionExecutiveTask) => (
                                <TableRow key={task.lead.id} className={cn(task.isOverdue && 'bg-destructive/10')}>
                                    <TableCell>
                                        <div className="font-medium">{task.lead.name}</div>
                                        <div className="text-sm text-muted-foreground">{task.lead.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        {task.isOverdue && <Badge variant="destructive" className="mr-2">Overdue</Badge>}
                                        {task.task_description}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(task.due_date), "PP")}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No tasks for today.
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
