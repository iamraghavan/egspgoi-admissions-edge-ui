
'use client';

import 'react-day-picker/dist/style.css';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createCampaign } from "@/lib/data";
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from "date-fns";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { courseData } from '@/lib/course-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


export default function CreateCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const [isSubmitting, setSubmitting] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const colleges = [...new Set(courseData.map(item => item['Institution Name']))];

    const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);

        const formData = new FormData(event.currentTarget);
        
        if (!date?.from || !date?.to) {
            toast({ variant: "destructive", title: "Please select a date range." });
            setSubmitting(false);
            return;
        }

        const payload = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            platform: formData.get('platform') as string,
            start_date: format(date.from, 'yyyy-MM-dd'),
            end_date: format(date.to, 'yyyy-MM-dd'),
            institution: formData.get('institution') as string,
            objective: formData.get('objective') as string,
            kpi: formData.get('kpi') as string,
            budget_estimate: parseFloat(formData.get('budget_estimate') as string),
            target_audience: {
                age: formData.get('target_audience_age') as string,
                location: formData.get('target_audience_location') as string,
            }
        };

        try {
            await createCampaign(payload as any);
            toast({ title: "Campaign Created", description: `${payload.name} has been successfully created.` });
            router.push(`/u/app/${params.role}/${params.encryptedUserId}/campaigns`);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create campaign", description: error.message });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Create New Campaign" description="Fill in the details to launch your new campaign.">
                 <Button variant="outline" asChild>
                    <Link href={`/u/app/${params.role}/${params.encryptedUserId}/campaigns`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Campaigns
                    </Link>
                </Button>
            </PageHeader>

            <form onSubmit={handleCreateCampaign}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-8">
                             <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campaign Name</Label>
                                    <Input id="name" name="name" placeholder="e.g., Summer Admissions 2026" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget_estimate">Budget Estimate</Label>
                                    <Input id="budget_estimate" name="budget_estimate" type="number" step="0.01" placeholder="e.g., 500000" required />
                                </div>
                            </div>
                             <div className="grid md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <Label>Date Range</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                            "w-full justify-start text-left font-normal",
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
                                            <span>Pick a date range</span>
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
                                            numberOfMonths={2}
                                        />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Campaign Type</Label>
                                    <Select name="type" required>
                                        <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Social Media">Social Media</SelectItem>
                                            <SelectItem value="Search Engine">Search Engine</SelectItem>
                                            <SelectItem value="Email">Email Marketing</SelectItem>
                                            <SelectItem value="Offline">Offline Event</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform</Label>
                                     <Select name="platform" required>
                                        <SelectTrigger><SelectValue placeholder="Select a platform" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Facebook">Facebook</SelectItem>
                                            <SelectItem value="Google">Google</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Instagram">Instagram</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="institution">Institution</Label>
                                    <Select name="institution" required>
                                        <SelectTrigger><SelectValue placeholder="Select an institution" /></SelectTrigger>
                                        <SelectContent>
                                            {colleges.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                             <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="objective">Objective</Label>
                                    <Textarea id="objective" name="objective" placeholder="e.g., Generate 5000 leads" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="kpi">Key Performance Indicator (KPI)</Label>
                                    <Textarea id="kpi" name="kpi" placeholder="e.g., Cost per Lead < 50 INR" required />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">Target Audience</h3>
                                <div className="grid md:grid-cols-2 gap-6 mt-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="target_audience_age">Age Range</Label>
                                        <Input id="target_audience_age" name="target_audience_age" placeholder="e.g., 17-21" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="target_audience_location">Location</Label>
                                        <Input id="target_audience_location" name="target_audience_location" placeholder="e.g., Tamil Nadu" required />
                                    </div>
                                </div>
                            </div>

                        </div>
                         <div className="flex justify-end gap-2 mt-8">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Campaign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
