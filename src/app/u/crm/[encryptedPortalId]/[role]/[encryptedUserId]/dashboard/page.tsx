import PageHeader from '@/components/page-header';
import StatsGrid from '@/components/dashboard/stats-grid';
import LeadsChart from '@/components/dashboard/leads-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLeads } from '@/lib/data';
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
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage({ params }: { params: { encryptedPortalId: string; encryptedUserId: string; role: string } }) {
  const recentLeads = (await getLeads()).slice(0, 5);
  const { encryptedPortalId, encryptedUserId, role } = params;

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
                        {recentLeads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                                </TableCell>
                                <TableCell className='text-right'>
                                    <Badge variant="outline" className='capitalize'>{lead.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
