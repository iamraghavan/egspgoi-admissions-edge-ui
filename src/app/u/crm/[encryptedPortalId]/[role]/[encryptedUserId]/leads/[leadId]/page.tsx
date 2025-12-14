
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeadById, getUserById, getUsers } from "@/lib/data";
import type { Lead, User } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadDetailHeader } from '@/components/leads/lead-detail-header';
import { LeadContactInfo } from '@/components/leads/lead-contact-info';
import { LeadCourseInfo } from '@/components/leads/lead-course-info';
import { LeadNotes } from '@/components/leads/lead-notes';
import { LeadAssignedAgent } from '@/components/leads/lead-assigned-agent';
import { LeadMetadata } from '@/components/leads/lead-metadata';

export default function LeadDetailPage() {
    const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string; leadId: string };
    const router = useRouter();
    const { toast } = useToast();
    
    const [lead, setLead] = useState<Lead | null>(null);
    const [assignedUser, setAssignedUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);

    const fetchLeadDetails = useCallback(async () => {
        if (!params.leadId) return;

        try {
            setLoading(true);
            const fetchedLead = await getLeadById(params.leadId);
            
            if (fetchedLead) {
                setLead(fetchedLead);
                if (fetchedLead.agent_id) {
                    const user = await getUserById(fetchedLead.agent_id);
                    setAssignedUser(user);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Lead not found",
                });
            }
        } catch (error: any) {
            console.error("Failed to fetch lead details", error);
            if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Your session has expired. Please log in again.",
                });
                handleLogout();
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to fetch lead",
                    description: error.message || "An unexpected error occurred.",
                });
            }
        } finally {
            setLoading(false);
        }
    }, [params.leadId, toast, handleLogout]);

    useEffect(() => {
        fetchLeadDetails();
    }, [fetchLeadDetails]);

    useEffect(() => {
        // In a real app, you might want to fetch only relevant users.
        getUsers().then(setUsers);
    }, []);

    const availableAgents = users.filter(user => user.role === 'Admission Executive' || user.role === 'Admission Manager');

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
            <LeadDetailHeader lead={lead} onLeadUpdate={fetchLeadDetails} availableAgents={availableAgents}/>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid gap-6">
                    <LeadContactInfo lead={lead} />
                    <LeadCourseInfo lead={lead} />
                    <LeadNotes lead={lead} onNoteAdded={fetchLeadDetails} />
                </div>

                <div className="space-y-6">
                    <LeadAssignedAgent user={assignedUser} />
                    <LeadMetadata lead={lead} />
                </div>
            </div>
        </div>
    );
}
