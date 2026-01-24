
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import type { AdminDashboardChartPoint } from '@/lib/types';

interface LeadsChartProps {
    data: AdminDashboardChartPoint[];
    loading: boolean;
}

export default function LeadsChart({ data, loading }: LeadsChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Leads Overview</CardTitle>
                    <CardDescription>Leads trend over the selected period.</CardDescription>
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
        <CardTitle>Leads Overview</CardTitle>
        <CardDescription>Leads trend over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{
            leads: {
                label: 'Leads',
                color: 'hsl(var(--primary))',
            },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                  />
                  <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dot' />}
                  />
                  <Bar
                      dataKey="value"
                      name="Leads"
                      radius={[4, 4, 0, 0]}
                      fill="hsl(var(--primary))"
                  />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
