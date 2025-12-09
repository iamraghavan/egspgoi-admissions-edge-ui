import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampaigns } from "@/lib/data";
import { PlusCircle, Calendar, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import placeholderImages from "@/lib/placeholder-images.json";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default async function CampaignsPage() {
    const campaigns = await getCampaigns();

    const getCampaignImage = (campaignId: string) => {
        const campaignImageMap: { [key: string]: string } = {
            'camp-1': 'campaign-fall-2024',
            'camp-2': 'campaign-spring-2025',
            'camp-3': 'campaign-summer-internships-2024',
            'camp-4': 'campaign-online-mba',
            'camp-5': 'campaign-data-science'
        };
        const imageId = campaignImageMap[campaignId] || 'campaign-fall-2024';
        return placeholderImages.placeholderImages.find(p => p.id === imageId);
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Planning': return 'secondary';
            case 'Completed': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Campaigns" description="Manage your marketing campaigns.">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Campaign
                </Button>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
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
                                    <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-2 mt-4">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{format(new Date(campaign.startDate), 'LLL dd, y')} - {format(new Date(campaign.endDate), 'LLL dd, y')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        <span>${campaign.budget.toLocaleString()} Budget</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full">View Details</Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
