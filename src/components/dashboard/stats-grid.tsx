
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CircleDollarSign, Landmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import type { AdminDashboardKpis } from '@/lib/types';

const StatCard = ({ title, value, icon: Icon, loading, isCurrency = false }: { title: string, value?: number | string, icon: React.ElementType, loading: boolean, isCurrency?: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-8 w-20" />
            ) : (
                <div className="text-2xl font-bold">
                    {(typeof value === 'number' && isCurrency) ? formatCurrency(value) : value ?? '0'}
                </div>
            )}
        </CardContent>
    </Card>
);

interface StatsGridProps {
    kpis: AdminDashboardKpis | null;
    loading: boolean;
}

export default function StatsGrid({ kpis, loading }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
            title={kpis?.total_leads?.label || "Total Leads"}
            value={kpis?.total_leads?.value}
            icon={Users}
            loading={loading}
        />
        <StatCard
            title={kpis?.ad_spend?.label || "Ad Spend"}
            value={kpis?.ad_spend?.value}
            icon={CircleDollarSign}
            loading={loading}
            isCurrency
        />
        <StatCard
            title={kpis?.active_users?.label || "Active Users"}
            value={kpis?.active_users?.value}
            icon={Users}
            loading={loading}
        />
        <StatCard
            title={kpis?.revenue?.label || "Total Revenue"}
            value={kpis?.revenue?.value}
            icon={Landmark}
            loading={loading}
            isCurrency
        />
    </div>
  );
}
