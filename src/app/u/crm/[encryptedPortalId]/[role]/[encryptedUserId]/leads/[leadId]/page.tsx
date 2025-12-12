
import { getLeadById, getUserById } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import type { Lead, User } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value || '-'}</dd>
    </div>
);

export default async function LeadDetailPage({ params }: { params: { encryptedPortalId: string; role: string; encryptedUserId: string; leadId: string } }) {
    const lead = await getLeadById(params.leadId);
    let assignedUser: User | undefined;
    if (lead?.agent_id) {
        assignedUser = await getUserById(lead.agent_id);
    }
    
    if (!lead) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Lead not found.</p>
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
                            <DetailItem label="Location" value={`${lead.district}, ${lead.state}`} />
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
                                    <li key={index} className="flex gap-3">
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
