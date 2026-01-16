
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCampaignById, updateCampaignStatus, uploadAsset } from '@/lib/data';
import type { Campaign, CampaignStatus, Asset } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Play, Pause, Power, Upload } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-xs text-muted-foreground uppercase font-medium">{label}</p>
        <p className="text-sm font-semibold">{value || '-'}</p>
    </div>
);

const getStatusVariant = (status: CampaignStatus) => {
    switch (status) {
        case 'active': return 'success';
        case 'draft': return 'secondary';
        case 'paused': return 'warning';
        case 'completed': return 'outline';
        default: return 'secondary';
    }
}

function AssetCard({ asset }: { asset: Asset }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{asset.name}</CardTitle>
                <Badge variant={asset.status === 'approved' ? 'success' : 'secondary'} className="w-fit capitalize">{asset.status}</Badge>
            </CardHeader>
            <CardContent>
                <img src={asset.storage_url} alt={asset.name} className="rounded-md aspect-video object-cover" />
                 <p className="text-xs text-muted-foreground mt-2">Uploaded: {format(new Date(asset.created_at), 'PP')}</p>
            </CardContent>
        </Card>
    );
}

function UploadAssetDialog({ campaignId, onUploadSuccess }: { campaignId: string, onUploadSuccess: () => void }) {
    const [isOpen, setOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const { toast } = useToast();

    const handleUpload = async () => {
        if (!file || !name) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please provide a name and select a file.' });
            return;
        }
        setSubmitting(true);
        try {
            await uploadAsset({ campaign_id: campaignId, name, file });
            toast({ title: 'Asset Uploaded', description: `${name} has been uploaded for review.` });
            onUploadSuccess();
            setOpen(false);
            setFile(null);
            setName('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Asset
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload New Asset</DialogTitle>
                    <DialogDescription>Select an image or video file to add to this campaign.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="asset-name">Asset Name</Label>
                        <Input id="asset-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Main Banner V1" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="asset-file">File</Label>
                        <Input id="asset-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={isSubmitting}>Upload</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function CampaignDetailPage() {
    const params = useParams() as { campaignId: string, role: string, encryptedUserId: string };
    const router = useRouter();
    const { toast } = useToast();
    
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCampaign = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedCampaign = await getCampaignById(params.campaignId);
            if (!fetchedCampaign) {
                toast({ variant: 'destructive', title: 'Not Found', description: 'This campaign could not be found.' });
                router.back();
            } else {
                setCampaign(fetchedCampaign);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [params.campaignId, router, toast]);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    const handleStatusChange = async (newStatus: CampaignStatus) => {
        if (!campaign) return;
        try {
            const updatedCampaign = await updateCampaignStatus(campaign.id, newStatus);
            setCampaign(updatedCampaign);
            toast({ title: 'Status Updated', description: `Campaign is now ${newStatus}.`});
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Status Update Failed', description: error.message });
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!campaign) return null;

    const backUrl = `/u/app/${params.role}/${params.encryptedUserId}/campaigns`;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title={campaign.name} description={`Campaign details for ${campaign.platform}`}>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                    {campaign.status === 'paused' || campaign.status === 'draft' ? (
                        <Button size="sm" variant="success" onClick={() => handleStatusChange('active')}>
                            <Play className="mr-2 h-4 w-4" /> Activate
                        </Button>
                    ) : campaign.status === 'active' ? (
                         <Button size="sm" variant="warning" onClick={() => handleStatusChange('paused')}>
                            <Pause className="mr-2 h-4 w-4" /> Pause
                        </Button>
                    ) : null}
                    {campaign.status !== 'completed' && (
                         <Button size="sm" variant="destructive" onClick={() => handleStatusChange('completed')}>
                            <Power className="mr-2 h-4 w-4" /> Mark as Completed
                        </Button>
                    )}
                </div>
            </PageHeader>

            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                         <CardTitle>Campaign Overview</CardTitle>
                         <Badge variant={getStatusVariant(campaign.status)} className="capitalize text-base">{campaign.status}</Badge>
                     </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DetailItem label="Daily Budget" value={formatCurrency(campaign.budget)} />
                    <DetailItem label="Date Range" value={`${format(new Date(campaign.start_date), 'PP')} - ${format(new Date(campaign.end_date), 'PP')}`} />
                    <DetailItem label="Objective" value={campaign.objective} />
                    <DetailItem label="KPI" value={campaign.kpi} />
                    <DetailItem label="Institution" value={campaign.institution} />
                    <DetailItem label="Platform" value={campaign.platform} />
                     <DetailItem label="Target Location" value={campaign.target_audience.location} />
                    <DetailItem label="Target Age" value={campaign.target_audience.age} />
                </CardContent>
            </Card>

            <Tabs defaultValue="assets">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="assets">Assets</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <UploadAssetDialog campaignId={campaign.id} onUploadSuccess={fetchCampaign} />
                    </div>
                </div>
                <TabsContent value="assets" className="mt-6">
                    {campaign.assets && campaign.assets.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {campaign.assets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-64">
                            <h3 className="text-xl font-semibold">No Assets Found</h3>
                            <p className="text-muted-foreground mt-2">Upload your first creative asset for this campaign.</p>
                        </div>
                    )}
                </TabsContent>
                 <TabsContent value="performance" className="mt-6">
                     <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-64">
                        <h3 className="text-xl font-semibold">Performance Tracking Coming Soon</h3>
                        <p className="text-muted-foreground mt-2">Check back later for detailed analytics.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
