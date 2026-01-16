
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserById } from "@/lib/data";
import type { User } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Role } from '@/lib/types';

const DetailItem = ({ label, value, isBadge = false }: { label: string, value: React.ReactNode, isBadge?: boolean }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isBadge ? value : <p className="text-sm text-foreground">{value || '-'}</p>}
    </div>
);

const RoleBadge = ({ role }: { role: Role }) => {
    const variant: "default" | "secondary" | "destructive" | "outline" =
        role === "Super Admin" ? "destructive"
        : role === "Admission Manager" ? "default"
        : role === "Marketing Manager" ? "default"
        : role === "Finance" ? "secondary"
        : "outline";
    
    return <Badge variant={variant} className="capitalize">{role}</Badge>
};


export default function UserDetailPage() {
    const params = useParams() as { userId: string; role: string; encryptedUserId: string };
    const router = useRouter();
    const { toast } = useToast();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserDetails = useCallback(async (isMounted: boolean) => {
        if (!params.userId) return;

        if (isMounted) setLoading(true);
        try {
            const fetchedUser = await getUserById(params.userId);
            
            if (isMounted) {
                if (fetchedUser) {
                    setUser(fetchedUser);
                } else {
                    toast({
                        variant: "destructive",
                        title: "User not found",
                    });
                    router.back();
                }
            }
        } catch (error: any) {
             if (isMounted) {
                toast({
                    variant: "destructive",
                    title: "Failed to fetch user",
                    description: error.message || "An unexpected error occurred.",
                });
             }
        } finally {
            if (isMounted) setLoading(false);
        }
    }, [params.userId, toast, router]);

    useEffect(() => {
        let isMounted = true;
        fetchUserDetails(isMounted);
        return () => {
            isMounted = false;
        };
    }, [fetchUserDetails]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-10 w-48 mb-4" />
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="md:col-span-2 grid gap-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }
    
    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>User not found or could not be loaded.</p>
            </div>
        );
    }
    
    const backUrl = `/u/portal/${params.role}/${params.encryptedUserId}/user-management`;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href={backUrl}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to User Management</span>
                    </Link>
                </Button>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{user.name}</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 flex flex-col items-center gap-4">
                     <Card className="w-full">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.designation}</p>
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <RoleBadge role={user.role} />
                                <Badge variant={(user as any).status === 'active' ? 'success' : 'secondary'} className="capitalize">{(user as any).status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2 grid gap-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem label="Email" value={<a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>} />
                            <DetailItem label="Phone" value={user.phone || 'N/A'} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Smartflo Configuration</CardTitle>
                             <CardDescription>Telephony settings for this user.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <DetailItem label="Agent Number" value={user.agent_number} />
                            <DetailItem label="Caller ID" value={user.caller_id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
