

'use client';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getLiveCalls } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import LiveCallCard from '@/components/calls/live-call-card';
import { cn } from '@/lib/utils';
import { isEqual } from 'lodash';

export default function CallMonitoringPage() {
    const [liveCalls, setLiveCalls] = useState<any[]>([]);
    const [loadingLiveCalls, setLoadingLiveCalls] = useState(true);
    
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);
    
    const fetchLiveCalls = useCallback(async () => {
        try {
            // Only show initial loading spinner
            if (liveCalls.length === 0) {
                setLoadingLiveCalls(true);
            }
            const fetchedLiveCalls = await getLiveCalls();

            // Only update state if the data has actually changed to prevent re-renders
            setLiveCalls(currentCalls => {
                const sortedCurrent = [...currentCalls].sort((a, b) => a.call_id.localeCompare(b.call_id));
                const sortedFetched = [...fetchedLiveCalls].sort((a, b) => a.call_id.localeCompare(b.call_id));
                
                if (!isEqual(sortedCurrent, sortedFetched)) {
                    return fetchedLiveCalls;
                }
                return currentCalls;
            });

        } catch (error: any) {
            console.error("Failed to fetch live calls:", error);
            if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token') || error.message.includes('Session expired')) {
                 toast({ variant: "destructive", title: "Session Expired", description: "Please log in again." });
                 handleLogout();
            }
        } finally {
            setLoadingLiveCalls(false);
        }
    }, [handleLogout, toast, liveCalls.length]);

    useEffect(() => {
        fetchLiveCalls();
        
        const interval = setInterval(fetchLiveCalls, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [fetchLiveCalls]);
    
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
                     {loadingLiveCalls && liveCalls.length === 0 ? (
                         <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            <p className="text-muted-foreground">Loading live calls...</p>
                        </div>
                     ) : liveCalls.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveCalls.map((call, index) => (
                                <LiveCallCard key={`${call.call_id}-${call.agent_name}-${call.customer_number}`} call={call} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">No active calls right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
