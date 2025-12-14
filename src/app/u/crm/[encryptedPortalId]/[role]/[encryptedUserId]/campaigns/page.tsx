

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampaigns, createCampaign } from "@/lib/data";
import { PlusCircle, Calendar as CalendarIcon, DollarSign, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import placeholderImagesData from "@/lib/placeholder-images.json";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import type { Campaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const isMobile = useIsMobile();

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
    
    const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const newCampaignData = {
            name: formData.get('name') as string,
            budget: Number(formData.get('budget')),
            startDate: date?.from?.toISOString() ?? '',
            endDate: date?.to?.toISOString() ?? '',
        };

        if (!newCampaignData.startDate || !newCampaignData.endDate) {
            toast({ variant: "destructive", title: "Please select a date range." });
            setSubmitting(false);
            return;
        }

        try {
            await createCampaign(newCampaignData as any);
            toast({ title: "Campaign Created", description: `${newCampaignData.name} has been successfully created.` });
            fetchCampaigns();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create campaign", description: error.message });
        } finally {
            setSubmitting(false);
            setCreateOpen(false);
            setDate(undefined);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Campaigns" description="Manage your marketing campaigns.">
                <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateCampaign}>
                            <DialogHeader>
                                <DialogTitle>Create New Campaign</DialogTitle>
                                <DialogDescription>Fill in the details for your new campaign.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" name="name" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="budget" className="text-right">Budget</Label>
                                    <Input id="budget" name="budget" type="number" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Date Range</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                              "col-span-3 justify-start text-left font-normal",
                                              !date && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                              date.to ? (
                                                <>
                                                  {format(date.from, "LLL dd, y")} -{" "}
                                                  {format(date.to, "LLL dd, y")}
                                                </>
                                              ) : (
                                                format(date.from, "LLL dd, y")
                                              )
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={setDate}
                                            numberOfMonths={isMobile ? 1 : 2}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                </div>
                            </div>
                             <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Campaign
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
