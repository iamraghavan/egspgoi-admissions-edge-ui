
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getLeadById, getUserById, getUsers } from "@/lib/data";
import type { Lead, User } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadDetailHeader } from '@/components/leads/lead-detail-header';
import { LeadContactInfo } from '@/components/leads/lead-contact-info';
import { LeadCourseInfo } from '@/components/leads/lead-course-info';
import { LeadNotes } from '@/components/leads/lead-notes';
import { LeadAssignedAgent } from '@/components/leads/lead-assigned-agent';
import { LeadMetadata } from '@/components/leads/lead-metadata';
import { LeadCallHistory } from '@/components/leads/lead-call-history';

export default function LeadDetailPage() {
    const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string; leadId: string };
    const { toast } = useToast();
    
    const [lead, setLead] = useState<Lead | null>(null);
    const [assignedUser, setAssignedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);

    const fetchLeadDetails = useCallback(async (isMounted: boolean) => {
        if (!params.leadId) return;

        if (isMounted) setLoading(true);
        try {
            const { data: fetchedLead, error } = await getLeadById(params.leadId);
            
            if (isMounted) {
                if (error) {
                     toast({
                        variant: "destructive",
                        title: "Failed to fetch lead",
                        description: error.message || "An unexpected error occurred.",
                    });
                } else if (fetchedLead) {
                    setLead(fetchedLead);
                    if (fetchedLead.assigned_user) {
                        setAssignedUser(fetchedLead.assigned_user);
                    }
                } else {
                    toast({
                        variant: "destructive",
                        title: "Lead not found",
                    });
                }
            }
        } finally {
            if (isMounted) setLoading(false);
        }
    }, [params.leadId, toast]);

    const fetchUsers = useCallback(async (isMounted: boolean) => {
        try {
            const fetchedUsers = await getUsers();
            if (isMounted) setUsers(fetchedUsers);
        } catch (err: any) {
             if (isMounted) {
                toast({
                    variant: "destructive",
                    title: "Failed to fetch users",
                    description: err.message || "Could not load agent list.",
                });
             }
        }
    },[toast]);

    useEffect(() => {
        let isMounted = true;
        fetchLeadDetails(isMounted);
        fetchUsers(isMounted);

        const handleRefresh = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail.leadId === params.leadId) {
                fetchLeadDetails(isMounted);
            }
        }

        window.addEventListener('leadDataShouldRefresh', handleRefresh);
        return () => {
            isMounted = false;
            window.removeEventListener('leadDataShouldRefresh', handleRefresh);
        }
    }, [fetchLeadDetails, fetchUsers, params.leadId]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20 ml-2" />
                </div>
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid gap-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="space-y-6">
                         <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }
    
    if (!lead) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Lead not found or could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <LeadDetailHeader lead={lead} onLeadUpdate={() => fetchLeadDetails(true)} availableAgents={users}/>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid gap-6">
                    <LeadContactInfo lead={lead} />
                    <LeadCourseInfo lead={lead} />
                    <LeadNotes lead={lead} onNoteAdded={() => fetchLeadDetails(true)} />
                     <LeadCallHistory leadId={lead.id} />
                </div>

                <div className="space-y-6">
                    <LeadAssignedAgent user={assignedUser} />
                    <LeadMetadata lead={lead} />
                </div>
            </div>
        </div>
    );
}
