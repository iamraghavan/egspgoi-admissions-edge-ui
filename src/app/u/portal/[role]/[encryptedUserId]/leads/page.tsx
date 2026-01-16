
'use client';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 
import { leadColumns } from '@/components/leads/columns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import type { Lead, Role } from '@/lib/types';
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

const LeadsDataTable = dynamic(() => import('@/components/leads/data-table'), {
    ssr: false,
    loading: () => <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
    </div>,
});


const roleSlugMap: Record<string, Role> = {
    'sa': 'Super Admin',
    'mm': 'Marketing Manager',
    'am': 'Admission Manager',
    'fin': 'Finance',
    'ae': 'Admission Executive',
};


export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams() as { role: string; encryptedUserId: string; };

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const userRole = roleSlugMap[params.role] || 'Admission Executive';
  const isAdmissionRole = userRole === 'Admission Manager' || userRole === 'Admission Executive';

  const fetchLeads = useCallback(async (
    { cursor, isNewSearch, range }: { cursor?: string | null; isNewSearch?: boolean; range?: DateRange } = {}
  ) => {
    if (cursor) {
        setIsFetchingMore(true);
    } else {
        setLoading(true);
    }

    const filters: { cursor?: string; startDate?: Date, endDate?: Date, assignedTo?: string } = {};
    if (cursor) filters.cursor = cursor;
    if (range?.from) filters.startDate = range.from;
    if (range?.to) filters.endDate = range.to;
    if (isAdmissionRole) filters.assignedTo = params.encryptedUserId;
    

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
  }, [toast, isAdmissionRole, params.encryptedUserId]);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadLeads() {
        if (!isMounted) return;
        setLoading(true);

        const filters: { startDate?: Date, endDate?: Date, assignedTo?: string } = {};
        if (dateRange?.from) filters.startDate = dateRange.from;
        if (dateRange?.to) filters.endDate = dateRange.to;
        if (isAdmissionRole) filters.assignedTo = params.encryptedUserId;

        const { leads: fetchedLeads, meta, error } = await getLeads(filters);

        if (!isMounted) return;

        if (error) {
            if (error.status !== 401 && error.status !== 403) {
                toast({
                    variant: "destructive",
                    title: "Failed to fetch leads",
                    description: error.message || "Could not retrieve lead data from the server.",
                });
            }
        } else {
            setLeads(fetchedLeads);
            setNextCursor(meta?.cursor || null);
        }
        setLoading(false);
    }

    loadLeads();

    return () => {
        isMounted = false;
    };
  }, [dateRange, isAdmissionRole, params.encryptedUserId, toast]);

  const handleDateRangeChange = (newDateRange?: DateRange) => {
    setDateRange(newDateRange);
  }

  const handleSearch = () => {
    fetchLeads({ isNewSearch: true, range: dateRange });
  }

  return (
    <div className="flex flex-col gap-4">
        <Breadcrumbs>
            <BreadcrumbItem href={`/u/portal/${params.role}/${params.encryptedUserId}/dashboard`}>Dashboard</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Leads</BreadcrumbItem>
        </Breadcrumbs>
       <PageHeader title="Leads" description="Manage and track all your prospective students." />
        <div className="flex-grow">
             <Tabs defaultValue="table" className="flex flex-col">
                <TabsList>
                    <TabsTrigger value="table">Data Table</TabsTrigger>
                    <TabsTrigger value="board">Kanban Board</TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="flex-grow">
                    <LeadsDataTable
                        columns={leadColumns}
                        data={leads}
                        loading={loading}
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
