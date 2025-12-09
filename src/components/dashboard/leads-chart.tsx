"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                    cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }}
                    content={<ChartTooltipContent />}
                />
                <Line
                    dataKey="leads"
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={true}
                />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
