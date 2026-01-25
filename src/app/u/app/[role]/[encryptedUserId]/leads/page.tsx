'use client';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 
import { leadColumns } from '@/components/leads/columns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import type { Lead, Role, LeadStatus, User } from '@/lib/types';
import { getLeads, getUsers } from '@/lib/data';
import type { DateRange } from 'react-day-picker';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import PageHeader from '@/components/page-header';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRangePicker } from 'react-date-range';
import { Filter, User as UserIcon, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


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

const leadStatuses: LeadStatus[] = ["New", "Contacted", "Interested", "Enrolled", "Failed"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams() as { role: string; encryptedUserId: string; };

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [agents, setAgents] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<Set<LeadStatus>>(new Set());
  const [ownerFilter, setOwnerFilter] = useState<Set<string>>(new Set());
  
  const userRole = roleSlugMap[params.role] || 'Admission Executive';
  const isAdmissionRole = userRole === 'Admission Manager' || userRole === 'Admission Executive';

  const fetchLeadsAndAgents = useCallback(async () => {
    setLoading(true);
    try {
        const [leadsResponse, agentsData] = await Promise.all([
            getLeads({ 
                assignedTo: isAdmissionRole ? params.encryptedUserId : undefined 
            }),
            getUsers()
        ]);
        
        if (leadsResponse.error) {
            toast({
                variant: "destructive",
                title: "Failed to fetch leads",
                description: leadsResponse.error.message || "Could not retrieve lead data.",
            });
        } else {
            setLeads(leadsResponse.leads);
            setNextCursor(leadsResponse.meta?.cursor || null);
        }
        
        setAgents(agentsData);

    } catch (err: any) {
        toast({
            variant: "destructive",
            title: "Failed to load page data",
            description: err.message,
        });
    } finally {
        setLoading(false);
    }
  }, [toast, isAdmissionRole, params.encryptedUserId]);

  useEffect(() => {
    fetchLeadsAndAgents();
  }, [fetchLeadsAndAgents]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    const filters: {
        startDate?: Date,
        endDate?: Date,
        assignedTo?: string[],
        status?: string[]
    } = {};

    if (dateRange?.from) filters.startDate = dateRange.from;
    if (dateRange?.to) filters.endDate = dateRange.to;
    if (ownerFilter.size > 0) filters.assignedTo = Array.from(ownerFilter);
    if (statusFilter.size > 0) filters.status = Array.from(statusFilter);

    if(isAdmissionRole && !filters.assignedTo) {
        filters.assignedTo = [params.encryptedUserId];
    }
    
    const { leads: fetchedLeads, meta, error } = await getLeads(filters);
    
    if(error){
        toast({
            variant: "destructive",
            title: "Failed to fetch leads",
            description: error.message || "Could not retrieve lead data.",
        });
    } else {
      setLeads(fetchedLeads);
      setNextCursor(meta?.cursor || null);
    }
    setLoading(false);
  }, [dateRange, ownerFilter, statusFilter, toast, isAdmissionRole, params.encryptedUserId]);

  const handleLeadUpdate = () => {
    handleSearch();
  };

  const toggleStatusFilter = (status: LeadStatus) => {
    setStatusFilter(prev => {
        const newSet = new Set(prev);
        if (newSet.has(status)) {
            newSet.delete(status);
        } else {
            newSet.add(status);
        }
        return newSet;
    });
  }

  const toggleOwnerFilter = (agentId: string) => {
    setOwnerFilter(prev => {
        const newSet = new Set(prev);
        if (newSet.has(agentId)) {
            newSet.delete(agentId);
        } else {
            newSet.add(agentId);
        }
        return newSet;
    });
  }

  const handleDateChange = (ranges: any) => {
    const { selection } = ranges;
    const newRange = { from: selection.startDate, to: selection.endDate };
    setDateRange(newRange);
  }
  
  return (
    <div className="flex flex-col gap-4">
        <Breadcrumbs>
            <BreadcrumbItem href={`/u/app/${params.role}/${params.encryptedUserId}/dashboard`}>Dashboard</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Leads</BreadcrumbItem>
        </Breadcrumbs>
       <PageHeader title="Leads" description="Manage and track all your prospective students." />

        <div className="flex flex-wrap items-center gap-2 pb-4 border-b">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm"><UserIcon className="mr-2 h-4 w-4" /> Contact Owner</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Owner</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                    {agents.map(agent => (
                        <DropdownMenuCheckboxItem key={agent.id} checked={ownerFilter.has(agent.id)} onCheckedChange={() => toggleOwnerFilter(agent.id)}>
                            {agent.name}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="sm"
                        className={cn(
                        "w-[260px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <DateRangePicker
                        onChange={handleDateChange}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={[{
                            startDate: dateRange?.from,
                            endDate: dateRange?.to,
                            key: 'selection'
                        }]}
                        direction="horizontal"
                    />
                </PopoverContent>
            </Popover>

             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Lead Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {leadStatuses.map(status => (
                        <DropdownMenuCheckboxItem key={status} checked={statusFilter.has(status)} onCheckedChange={() => toggleStatusFilter(status)}>
                            {status}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleSearch} className="bg-primary/90 hover:bg-primary">Apply Filters</Button>
        </div>


        <Card>
            <CardContent className="p-0">
                <Tabs defaultValue="table" className="flex flex-col">
                    <TabsList className="p-1.5 bg-transparent border-b rounded-none">
                        <TabsTrigger value="table">Data Table</TabsTrigger>
                        <TabsTrigger value="board">Kanban Board</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table" className="flex-grow p-4">
                        <LeadsDataTable
                            columns={leadColumns}
                            data={leads}
                            loading={loading}
                            refreshData={handleLeadUpdate}
                        />
                    </TabsContent>
                    <TabsContent value="board" className="mt-0 p-4 flex-grow">
                        <KanbanBoard leads={leads} isLoading={loading} onLeadUpdate={handleLeadUpdate} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
