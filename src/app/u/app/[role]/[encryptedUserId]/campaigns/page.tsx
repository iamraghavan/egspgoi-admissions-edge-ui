
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getCampaigns, deleteCampaign } from "@/lib/data";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import type { Campaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import DataTable from '@/components/leads/data-table';
import { campaignColumns } from '@/components/campaigns/columns';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
    
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);

    const fetchCampaigns = useCallback(async () => {
        let isMounted = true;
        try {
            if(isMounted) setLoading(true);
            const fetchedCampaigns = await getCampaigns();
            if(isMounted) setCampaigns(fetchedCampaigns);
        } catch (error: any) {
            if (isMounted) {
                toast({ variant: "destructive", title: "Failed to fetch campaigns", description: error.message || "An unexpected error occurred." });
            }
        } finally {
            if(isMounted) setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [toast]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleDeleteClick = (campaign: Campaign) => {
        setCampaignToDelete(campaign);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete) return;
        try {
            await deleteCampaign(campaignToDelete.id);
            toast({
                title: "Campaign Deleted",
                description: `${campaignToDelete.name} has been permanently deleted.`,
            });
            fetchCampaigns(); // Re-fetch campaigns
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: error.message,
            });
        } finally {
            setCampaignToDelete(null);
        }
    };


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
                meta={{
                    onDelete: handleDeleteClick
                }}
            />
            {campaignToDelete && (
                 <ConfirmationDialog
                    isOpen={!!campaignToDelete}
                    onOpenChange={(isOpen) => !isOpen && setCampaignToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Confirm Permanent Deletion"
                    description={`Are you sure you want to permanently delete the campaign "${campaignToDelete.name}"? This action cannot be undone.`}
                    confirmText="Permanently Delete"
                />
            )}
        </div>
    );
}
