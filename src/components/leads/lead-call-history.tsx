
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLeadCallLogs } from '@/lib/data';
import type { CallLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { callLogsColumns } from './lead-call-history-columns';
import DataTable from './data-table';

interface LeadCallHistoryProps {
    leadId: string;
}

export function LeadCallHistory({ leadId }: LeadCallHistoryProps) {
    const { toast } = useToast();
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchLogs = async () => {
            if (isMounted) setIsLoading(true);
            try {
                const logs = await getLeadCallLogs(leadId);
                if (isMounted) setCallLogs(logs);
            } catch (error: any) {
                if (isMounted) {
                    toast({
                        variant: "destructive",
                        title: "Failed to fetch call history",
                        description: error.message,
                    });
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        if (leadId) {
            fetchLogs();
        }

        return () => {
            isMounted = false;
        };
    }, [leadId, toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Call History</CardTitle>
                <CardDescription>A log of all inbound and outbound calls for this lead.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable 
                    columns={callLogsColumns} 
                    data={callLogs} 
                    loading={isLoading}
                    searchKey="call_status"
                    searchPlaceholder="Filter by status..."
                />
            </CardContent>
        </Card>
    );
}
