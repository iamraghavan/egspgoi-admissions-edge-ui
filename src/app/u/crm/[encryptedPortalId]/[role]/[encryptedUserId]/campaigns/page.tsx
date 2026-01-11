
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getCampaigns } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import type { Campaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import DataTable from '@/components/leads/data-table';
import { campaignColumns } from '@/components/campaigns/columns';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);

    useEffect(() => {
        let isMounted = true;
        const fetchCampaigns = async () => {
            try {
                if(isMounted) setLoading(true);
                const fetchedCampaigns = await getCampaigns();
                if(isMounted) setCampaigns(fetchedCampaigns);
            } catch (error: any) {
                if (isMounted) {
                    if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
                        toast({ variant: "destructive", title: "Session Expired", description: "Your session has expired. Please log in again." });
                        handleLogout();
                    } else {
                        toast({ variant: "destructive", title: "Failed to fetch campaigns", description: error.message || "An unexpected error occurred." });
                    }
                }
            } finally {
                if(isMounted) setLoading(false);
            }
        }
        fetchCampaigns();

        return () => {
            isMounted = false;
        };
    }, [toast, handleLogout]);

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <PageHeader title="Campaigns" description="Manage your marketing campaigns.">
                     <Button asChild>
                        <Link href={`${pathname}/create`}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Link>
                    </Button>
                </PageHeader>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }


    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Campaigns" description="Manage your marketing campaigns.">
                 <Button asChild>
                    <Link href={`${pathname}/create`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Link>
                </Button>
            </PageHeader>
            <DataTable 
                columns={campaignColumns}
                data={campaigns}
                searchKey="name"
                searchPlaceholder="Filter campaigns by name..."
            />
        </div>
    );
}
