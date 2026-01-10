
'use client';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { DateRange as DateRangeType } from 'react-day-picker';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/leads/data-table';
import { callRecordsColumns } from '@/components/calls/records-columns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { getCallRecords, getUsers, getLiveCalls } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import type { User, LiveCall } from '@/lib/types';
import { format } from 'date-fns';
import LiveCallCard from '@/components/calls/live-call-card';
import { cn } from '@/lib/utils';
import { DateRangePicker } from 'react-date-range';
import { Label } from '@/components/ui/label';

export default function CallMonitoringPage() {
    const [records, setRecords] = useState([]);
    const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [loadingLiveCalls, setLoadingLiveCalls] = useState(true);
    const [dateRange, setDateRange] = useState<DateRangeType | undefined>();
    const [direction, setDirection] = useState<'inbound' | 'outbound' | 'all'>('all');
    const [agent, setAgent] = useState('all');
    const [page, setPage] = useState(1);
    const [canLoadMore, setCanLoadMore] = useState(false);
    
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);
    
    const fetchRecords = useCallback(async (isNewSearch = false) => {
        if (!dateRange?.from) {
            toast({
                variant: 'destructive',
                title: 'Date Range Required',
                description: 'Please select a date range to fetch call records.',
            });
            return;
        }

        setLoadingRecords(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const params: any = { page: currentPage, limit: 20 };
            params.from_date = format(dateRange.from, 'yyyy-MM-dd HH:mm:ss');
            if(dateRange.to) params.to_date = format(dateRange.to, 'yyyy-MM-dd HH:mm:ss');
            
            if (direction !== 'all') params.direction = direction;
            
            const selectedAgent = users.find(u => u.id === agent);
            if (selectedAgent?.agent_number) {
                 params.agent_number = selectedAgent.agent_number;
            } else if (agent !== 'all') {
                const agentData = users.find(u => u.id === agent);
                if(agentData?.name){
                    params.agent_name = agentData.name;
                }
            }


            const response = await getCallRecords(params);
            
            if(response.success) {
                const newRecords = response.results || [];
                setRecords(isNewSearch ? newRecords : [...records, ...newRecords]);
                setCanLoadMore(newRecords.length > 0 && response.count > (currentPage * (response.limit || 20)));
                 if (isNewSearch) {
                    setPage(2);
                } else {
                    setPage(prev => prev + 1);
                }
            } else {
                 throw new Error(response.message || 'Failed to fetch records');
            }
        } catch (error: any) {
             if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token') || error.message.includes('Session expired')) {
                toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
                handleLogout();
            } else {
                toast({ variant: "destructive", title: "Failed to fetch records", description: error.message });
            }
        } finally {
            setLoadingRecords(false);
        }
    }, [page, dateRange, direction, agent, toast, handleLogout, records, users]);

    const fetchLiveCalls = useCallback(async () => {
        try {
            setLoadingLiveCalls(true);
            const fetchedLiveCalls = await getLiveCalls();
            setLiveCalls(fetchedLiveCalls);
        } catch (error: any) {
            console.error("Failed to fetch live calls:", error);
            if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token') || error.message.includes('Session expired')) {
                 toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
                 handleLogout();
            }
        } finally {
            setLoadingLiveCalls(false);
        }
    }, [handleLogout, toast]);

    useEffect(() => {
        getUsers().then(setUsers).catch(err => {
            if (err.message.includes('Authentication token') || err.message.includes('Invalid or expired token') || err.message.includes('Session expired')) {
                 toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
                 handleLogout();
            } else {
                toast({ variant: "destructive", title: "Failed to load agents", description: err.message });
            }
        });
        fetchLiveCalls();
        
        const interval = setInterval(fetchLiveCalls, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [fetchLiveCalls, handleLogout, toast]);

    const handleSearch = () => {
        setRecords([]); // Clear old records
        setPage(1); // Reset page
        fetchRecords(true);
    }

    const handleDateChange = (ranges: any) => {
        const { selection } = ranges;
        const newRange = { from: selection.startDate, to: selection.endDate };
        setDateRange(newRange);
    }
    
    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Smartflo Call Management" description="Monitor live calls and manage historical records." />
            
            <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <div>
                        <CardTitle>Live Call Monitoring</CardTitle>
                        <CardDescription>A real-time view of all ongoing calls.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchLiveCalls} disabled={loadingLiveCalls}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", loadingLiveCalls && "animate-spin")} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                     {loadingLiveCalls ? (
                         <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            <p className="text-muted-foreground">Loading live calls...</p>
                        </div>
                     ) : liveCalls.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveCalls.map((call) => (
                                <LiveCallCard key={call.callId} call={call} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">No active calls right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Call History</CardTitle>
                    <CardDescription>Review and filter through past call records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4 mb-6">
                         <div className="grid w-full max-w-xs items-center gap-1.5">
                            <Label className="text-sm font-medium">Date Range (Required)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
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
                        </div>
                         <div className="grid w-full max-w-xs items-center gap-1.5">
                            <Label className="text-sm font-medium">Call Direction</Label>
                             <Select onValueChange={(val: any) => setDirection(val)} value={direction}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Directions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="inbound">Inbound</SelectItem>
                                    <SelectItem value="outbound">Outbound</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid w-full max-w-xs items-center gap-1.5">
                            <Label className="text-sm font-medium">Agent</Label>
                            <Select onValueChange={setAgent} value={agent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Agents" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={handleSearch} disabled={loadingRecords && page === 1}>
                                {loadingRecords && page === 1 && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Search
                            </Button>
                        </div>
                    </div>
                    <DataTable 
                        columns={callRecordsColumns} 
                        data={records}
                        loading={loadingRecords && page === 1}
                        searchKey="call_id" 
                        searchPlaceholder="Filter by ID..."
                        onLoadMore={canLoadMore ? () => fetchRecords() : undefined}
                        canLoadMore={canLoadMore}
                        isFetchingMore={loadingRecords && page > 1}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

    