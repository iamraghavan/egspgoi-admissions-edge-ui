'use client';
    
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAdSpends } from '@/lib/data';
import type { AdSpend } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export default function AdSpendChart() {
  const [chartData, setChartData] = useState<AdSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const spends = await getAdSpends();
        
        const aggregatedSpends = spends.reduce((acc, spend) => {
          const date = new Date(spend.date).toLocaleDateString('en-CA');
          if (!acc[date]) {
            acc[date] = { ...spend, date: date, budget_allocated: 0, actual_spend: 0 };
          }
          acc[date].budget_allocated += spend.budget_allocated;
          acc[date].actual_spend += spend.actual_spend;
          return acc;
        }, {} as Record<string, any>);

        const sortedData = Object.values(aggregatedSpends).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setChartData(sortedData);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to load ad spend data', description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Spend Overview</CardTitle>
          <CardDescription>Budgeted vs. Actual Spend</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Spend Overview</CardTitle>
        <CardDescription>Budgeted vs. Actual Spend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{
            budget_allocated: { label: "Budgeted", color: "hsl(var(--chart-1))" },
            actual_spend: { label: "Actual Spend", color: "hsl(var(--chart-2))" },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value as number)} tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                <Legend />
                <Bar dataKey="actual_spend" fill="var(--color-actual_spend)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="budget_allocated" stroke="var(--color-budget_allocated)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
