"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { getLeadsOverTime } from '@/lib/data';

type ChartData = {
  date: string;
  leads: number;
}[];

export default function LeadsChart() {
    const [chartData, setChartData] = useState<ChartData>([]);

    useEffect(() => {
        getLeadsOverTime().then(setChartData);
    }, []);

    if (chartData.length === 0) {
        return (
            <Card className="h-[450px] flex items-center justify-center">
                <p>Loading chart data...</p>
            </Card>
        );
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Overview</CardTitle>
        <CardDescription>Monthly leads generated in the first half of the year.</CardDescription>
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
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
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
                      dataKey="leads"
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
