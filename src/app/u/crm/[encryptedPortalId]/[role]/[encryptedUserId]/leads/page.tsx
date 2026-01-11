

'use client';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 
import LeadsDataTable from '@/components/leads/data-table';
import { leadColumns } from '@/components/leads/columns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '@/lib/types';
import { getLeads } from '@/lib/data';
import type { DateRange } from 'react-day-picker';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import PageHeader from '@/components/page-header';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const KanbanBoard = dynamic(() => import('@/components/leads/kanban-board'), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});


export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string; };

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchLeads = useCallback(async (
    { cursor, isNewSearch, range }: { cursor?: string | null; isNewSearch?: boolean; range?: DateRange } = {}
  ) => {
    if (cursor) {
        setIsFetchingMore(true);
    } else {
        setLoading(true);
    }

    const filters: { cursor?: string; startDate?: Date, endDate?: Date } = {};
    if (cursor) filters.cursor = cursor;
    if (range?.from) filters.startDate = range.from;
    if (range?.to) filters.endDate = range.to;
    

    const { leads: fetchedLeads, meta, error } = await getLeads(filters);
    
    if(error){
        if (error.status !== 401 && error.status !== 403) {
            toast({
                variant: "destructive",
                title: "Failed to fetch leads",
                description: error.message || "Could not retrieve lead data from the server.",
            });
        }
    } else {
      setLeads(prev => (cursor && !isNewSearch) ? [...prev, ...fetchedLeads] : fetchedLeads);
      setNextCursor(meta?.cursor || null);
    }
    setLoading(false);
    setIsFetchingMore(false);
  }, [toast]);
  
  useEffect(() => {
    fetchLeads({ isNewSearch: true, range: dateRange });
  }, [fetchLeads, dateRange]);

  const handleDateRangeChange = (newDateRange?: DateRange) => {
    setDateRange(newDateRange);
  }

  const handleSearch = () => {
    fetchLeads({ isNewSearch: true, range: dateRange });
  }

  return (
    <div className="flex flex-col gap-4 h-full">
        <Breadcrumbs>
            <BreadcrumbItem href={`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/dashboard`}>Dashboard</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Leads</BreadcrumbItem>
        </Breadcrumbs>
       <PageHeader title="Leads" description="Manage and track all your prospective students." />
        <div className="flex-grow">
             <Tabs defaultValue="table" className="h-full flex flex-col">
                <TabsList>
                    <TabsTrigger value="table">Data Table</TabsTrigger>
                    <TabsTrigger value="board">Kanban Board</TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="flex-grow">
                    <LeadsDataTable
                        columns={leadColumns}
                        data={leads}
                        loading={loading}
                        onLoadMore={nextCursor ? () => fetchLeads({ cursor: nextCursor, range: dateRange }) : undefined}
                        canLoadMore={!!nextCursor}
                        isFetchingMore={isFetchingMore}
                        refreshData={handleSearch}
                        dateRange={dateRange}
                        setDateRange={handleDateRangeChange}
                        searchKey="name"
                        searchPlaceholder="Filter leads by name..."
                    />
                </TabsContent>
                <TabsContent value="board" className="mt-6 flex-grow">
                  <KanbanBoard leads={leads} isLoading={loading} onLeadUpdate={handleSearch} />
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
