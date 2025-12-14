

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampaigns } from "@/lib/data";
import { PlusCircle, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import placeholderImagesData from "@/lib/placeholder-images.json";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import type { Campaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    
    const { placeholderImages } = placeholderImagesData;
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);

    const fetchCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedCampaigns = await getCampaigns();
            setCampaigns(fetchedCampaigns);
        } catch (error: any) {
            if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
                toast({ variant: "destructive", title: "Session Expired", description: "Your session has expired. Please log in again." });
                handleLogout();
            } else {
                toast({ variant: "destructive", title: "Failed to fetch campaigns", description: error.message || "An unexpected error occurred." });
            }
        } finally {
            setLoading(false);
        }
    }, [toast, handleLogout]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);


    const getCampaignImage = (campaignId: string) => {
        const imageId = 'campaign-fall-2024'; // fallback
        return placeholderImages.find(p => p.id === imageId);
    }

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'draft': return 'secondary';
            case 'completed': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Campaigns" description="Manage your marketing campaigns.">
                 <Button asChild>
                    <Link href={`${router.asPath}/create`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Link>
                </Button>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-[200px] w-full" /></CardHeader>
                            <CardContent className="pt-6"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent>
                            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))
                ) : (
                    campaigns.map((campaign) => {
                        const campaignImage = getCampaignImage(campaign.id);
                        return (
                            <Card key={campaign.id} className="flex flex-col">
                                <CardHeader className="p-0">
                                    {campaignImage && (
                                        <Image
                                            src={campaignImage.imageUrl}
                                            alt={campaignImage.description}
                                            width={600}
                                            height={400}
                                            className="rounded-t-lg aspect-[3/2] object-cover"
                                            data-ai-hint={campaignImage.imageHint}
                                        />
                                    )}
                                </CardHeader>
                                <CardContent className="pt-6 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl mb-2">{campaign.name}</CardTitle>
                                        <Badge variant={getStatusVariant(campaign.status)} className="capitalize">{campaign.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-2 mt-4">
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            <span>{format(new Date(campaign.startDate), 'LLL dd, y')} - {format(new Date(campaign.endDate), 'LLL dd, y')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            <span>${campaign.budget.toLocaleString()} Budget</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="secondary" className="w-full" asChild>
                                        <a href={`/u/crm/portal/role/user/campaigns/${campaign.id}`}>View Details</a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
