
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Megaphone, Phone, Percent } from 'lucide-react';
import { getDashboardStats } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

interface DashboardStats {
    newLeads: number;
    activeCampaigns: number;
    callsToday: number;
    conversionRate: number;
}

const StatCard = ({ title, value, icon: Icon, percentage, loading }: { title: string, value?: number | string, icon: React.ElementType, percentage?: string, loading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? (
                <>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-4 w-28" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    {percentage && <p className="text-xs text-muted-foreground">{percentage}</p>}
                </>
            )}
        </CardContent>
    </Card>
);


export default function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            setLoading(true);
            const fetchedStats = await getDashboardStats();
            setStats(fetchedStats);
        } catch (error: any) {
            console.error("Failed to fetch dashboard stats", error);
            // This component won't handle session errors directly anymore
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
            title="New Leads"
            value={stats?.newLeads}
            icon={Users}
            percentage="+10.2% from last month"
            loading={loading}
        />
        <StatCard
            title="Active Campaigns"
            value={stats?.activeCampaigns}
            icon={Megaphone}
            percentage="+2 since last week"
            loading={loading}
        />
        <StatCard
            title="Calls Today"
            value={stats?.callsToday}
            icon={Phone}
            percentage="+5% from yesterday"
            loading={loading}
        />
        <StatCard
            title="Conversion Rate"
            value={stats ? `${stats.conversionRate}%` : undefined}
            icon={Percent}
            percentage="+1.5% from last month"
            loading={loading}
        />
    </div>
  );
}
