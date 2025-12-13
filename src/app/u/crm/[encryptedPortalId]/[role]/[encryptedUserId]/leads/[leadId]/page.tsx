'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeadById, getUserById, getUsers, initiateCall, transferLead } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Mail, MessageSquare, Phone, UserSwitch, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Lead, User } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value || '-'}</dd>
    </div>
);

export default function LeadDetailPage() {
    const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string; leadId: string };
    const router = useRouter();
    const { toast } = useToast();
    
    const [lead, setLead] = useState<Lead | null>(null);
    const [assignedUser, setAssignedUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [isTransferring, setTransferring] = useState(false);
    const [isCalling, setCalling] = useState(false);
    const [isTransferDialogOpen, setTransferDialogOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<string>('');

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
        getUsers().then(setUsers);
    }, []);

    const availableAgents = useMemo(() => {
        return users.filter(user => user.role === 'Admission Executive' || user.role === 'Admission Manager');
    }, [users]);


    const handleInitiateCall = async () => {
        if (!lead) return;
        setCalling(true);
        try {
            // This is a placeholder for getting the current agent's number
            const agentNumber = "1234567890";
            await initiateCall(lead.id, agentNumber);
            toast({
                title: "Call Initiated",
                description: `A call is being connected to ${lead.name}.`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to Initiate Call",
                description: error.message,
            });
        } finally {
            setCalling(false);
        }
    };
    
    const handleTransferLead = async () => {
        if (!lead || !selectedAgent) return;
        setTransferring(true);
        try {
            await transferLead(lead.id, selectedAgent);
            toast({
                title: "Lead Transferred",
                description: `Lead has been successfully transferred.`,
            });
            await fetchLeadDetails(); // Re-fetch lead to show updated assignee
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to Transfer Lead",
                description: error.message,
            });
        } finally {
            setTransferring(false);
            setTransferDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20 ml-2" />
                    <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid gap-6">
                        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                    </div>
                    <div className="space-y-6">
                         <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
                         <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
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
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/leads`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to leads</span>
                    </Link>
                </Button>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{lead.name}</h1>
                <Badge variant="outline" className="capitalize text-sm ml-2">{lead.status}</Badge>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleInitiateCall} disabled={isCalling}>
                        {isCalling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                        Call Lead
                    </Button>
                    <Dialog open={isTransferDialogOpen} onOpenChange={setTransferDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <UserSwitch className="mr-2 h-4 w-4" />
                                Transfer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Transfer Lead</DialogTitle>
                                <DialogDescription>
                                    Assign this lead to another agent.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Select onValueChange={setSelectedAgent} defaultValue={lead.agent_id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableAgents.map(agent => (
                                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleTransferLead} disabled={isTransferring || !selectedAgent}>
                                    {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Transfer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2 grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem label="Email" value={<a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>} />
                            <DetailItem label="Phone" value={<a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>} />
                            <DetailItem label="Location" value={lead.district && lead.state ? `${lead.district}, ${lead.state}` : 'N/A'} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Interest</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem label="College" value={lead.college} />
                            <DetailItem label="Course" value={lead.course} />
                            <DetailItem label="Admission Year" value={lead.admission_year} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lead.notes && lead.notes.length > 0 ? (
                                <ul className="space-y-4">
                                {lead.notes.map((note, index) => (
                                    <li key={note.id || index} className="flex gap-3">
                                        <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm">{note.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Added by {note.author_name} - {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No notes for this lead yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Agent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedUser ? (
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={assignedUser.avatarUrl} />
                                        <AvatarFallback>{assignedUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{assignedUser.name}</p>
                                        <p className="text-sm text-muted-foreground">{assignedUser.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Unassigned</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem label="Lead ID" value={lead.lead_reference_id} />
                            <DetailItem label="Source" value={lead.source_website} />
                            <DetailItem label="Created" value={format(new Date(lead.created_at), 'PPpp')} />
                            <DetailItem label="Last Contact" value={format(new Date(lead.last_contacted_at), 'PPpp')} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
