
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/leads/data-table';
import { callRecordsColumns } from '@/components/calls/records-columns';
import { Button } from '@/components/ui/button';
import { DropdownRangeDatePicker } from '@/components/ui/dropdown-range-date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { getCallRecords, getUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import HangupForm from '@/components/calls/hangup-form';
import type { User } from '@/lib/types';
import { format } from 'date-fns';

export default function CallMonitoringPage() {
    const [records, setRecords] = useState([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
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
        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const params: any = { page: currentPage };
            if (dateRange?.from) params.from_date = format(dateRange.from, 'yyyy-MM-dd HH:mm:ss');
            if (dateRange?.to) params.to_date = format(dateRange.to, 'yyyy-MM-dd HH:mm:ss');
            if (direction !== 'all') params.direction = direction;
            if (agent !== 'all') params.agent_name = agent;

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
             if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
                toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
                handleLogout();
            } else {
                toast({ variant: "destructive", title: "Failed to fetch records", description: error.message });
            }
        } finally {
            setLoading(false);
        }
    }, [page, dateRange, direction, agent, toast, handleLogout, records]);

    useEffect(() => {
        getUsers().then(setUsers);
    }, []);

    const handleSearch = () => {
        setRecords([]); // Clear old records
        setPage(1); // Reset page
        fetchRecords(true);
    }
    
    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Smartflo Call Management" description="Monitor calls and manage call records." />
            
            <Card>
                <CardHeader>
                    <CardTitle>Call Controls</CardTitle>
                    <CardDescription>Use the form below to manually hang up an active call.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HangupForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Call Records</CardTitle>
                    <CardDescription>Review and filter through past call records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4 mb-6">
                        <div className="grid w-full max-w-xs items-center gap-1.5">
                            <label className="text-sm font-medium">Date Range</label>
                            <DropdownRangeDatePicker selected={dateRange} onSelect={setDateRange} />
                        </div>
                         <div className="grid w-full max-w-xs items-center gap-1.5">
                            <label className="text-sm font-medium">Call Direction</label>
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
                            <label className="text-sm font-medium">Agent</label>
                            <Select onValueChange={setAgent} value={agent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Agents" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {users.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={handleSearch} disabled={loading && page === 1}>
                                {loading && page === 1 && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleSearch} disabled={loading && page === 1}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading && page === 1 ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                    <DataTable 
                        columns={callRecordsColumns} 
                        data={records}
                        loading={loading && page === 1}
                        searchKey="call_id" // Not used for filtering, but required by component
                        searchPlaceholder="Filter by ID..." // Not used
                        onLoadMore={canLoadMore ? () => fetchRecords() : undefined}
                        canLoadMore={canLoadMore}
                        isFetchingMore={loading && page > 1}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
