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
    <div className="flex flex-col gap-8">
      <PageHeader title="Welcome Back, Sarah!" description="Here's a snapshot of your admissions activity." />
      <StatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <LeadsChart />
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Recent Leads</CardTitle>
                     <Button asChild variant="ghost" size="sm" className="text-sm">
                        <Link href={`/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/leads`}>
                            View All <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell>
                                        <div className="font-medium">{lead.name}</div>
                                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{lead.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
