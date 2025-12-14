'use client';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


const courseData = [
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Biomedical Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Civil Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Computer Science and Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Electronics and Communication Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Electrical and Electronics Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Mechanical Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.Tech", "Course / Specialization": "Artificial Intelligence and Data Science" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.Tech", "Course / Specialization": "Computer Science and Business Systems" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.Tech", "Course / Specialization": "Information Technology" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Communication Systems" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Computer Science and Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Environmental Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Power Electronics and Drives" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Manufacturing Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "MCA", "Course / Specialization": "Master of Computer Application" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "MBA", "Course / Specialization": "Master of Business Administration" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "All Departments" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.A", "Course / Specialization": "Tamil" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.A", "Course / Specialization": "English" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.A", "Course / Specialization": "Defense and Strategic Studies" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "General" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "Computer Application" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "Professional Accounting" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "Business Process Service" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.B.A", "Course / Specialization": "Business Administration" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.C.A", "Course / Specialization": "Computer Applications" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Computer Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Computer Science with Cognitive System" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Information Technology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Visual Communication" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Fashion Technology & Costume Designing" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Physics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Maths" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Chemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Biochemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Biotechnology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Nutrition & Dietetics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Hospital Administration" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Data Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Microbiology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Artificial Intelligence & Machine Learning" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Com", "Course / Specialization": "Commerce" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.B.A", "Course / Specialization": "Business Administration" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.A", "Course / Specialization": "English" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Computer Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Information Technology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Physics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Maths" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Chemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Biochemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Biotechnology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Food Science & Nutrition" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "English" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Physics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Commerce" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Management" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Computer Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Biochemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Biotechnology" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Civil Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Computer Science and Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Electronics and Communication Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Electrical and Electronics Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Mechanical Engineering" },
   { "Institution Name": "EGS Pillay School & College of Nursing", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Nursing" },
   { "Institution Name": "EGS Pillay School & College of Nursing", "Category": "Diploma", "Degree/Level": "DGNM", "Course / Specialization": "Diploma in General Nursing and Midwifery" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "Diploma", "Degree/Level": "D. Pharm", "Course / Specialization": "Pharmacy" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "UG", "Degree/Level": "B. Pharm", "Course / Specialization": "Pharmacy" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "Doctorate", "Degree/Level": "Pharm. D", "Course / Specialization": "Doctor of Pharmacy" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "PG", "Degree/Level": "M. Pharm", "Course / Specialization": "Pharmacy" },
   { "Institution Name": "EGS Pillay Naturopathy & Yoga Medical College", "Category": "UG", "Degree/Level": "-", "Course / Specialization": "BNYS" },
   { "Institution Name": "EGS Pillay College of Education", "Category": "UG", "Degree/Level": "B.Ed", "Course / Specialization": "All Subjects" },
   { "Institution Name": "EGS Pillay School", "Category": "School", "Degree/Level": "-", "Course / Specialization": "International School" },
   { "Institution Name": "EGS Pillay School", "Category": "School", "Degree/Level": "-", "Course / Specialization": "Matriculation School" },
   { "Institution Name": "EGS Pillay School", "Category": "School", "Degree/Level": "-", "Course / Specialization": "Nursery and Primary School" }
];

export default function CreateCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const [isSubmitting, setSubmitting] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>();

    const colleges = [...new Set(courseData.map(item => item['Institution Name']))];

    const handleCreateCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);

        const formData = new FormData(event.currentTarget);
        
        if (!date?.from || !date.to) {
            toast({ variant: "destructive", title: "Please select a date range." });
            setSubmitting(false);
            return;
        }

        const payload = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            platform: formData.get('platform') as string,
            status: 'draft',
            start_date: format(date.from, 'yyyy-MM-dd'),
            end_date: format(date.to, 'yyyy-MM-dd'),
            institution: formData.get('institution') as string,
            objective: formData.get('objective') as string,
            kpi: formData.get('kpi') as string,
            target_audience: {
                age: formData.get('target_audience_age') as string,
                location: formData.get('target_audience_location') as string,
            },
            settings: {
                budget_daily: Number(formData.get('budget')),
            }
        };

        try {
            await createCampaign(payload as any);
            toast({ title: "Campaign Created", description: `${payload.name} has been successfully created.` });
            router.push(`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/campaigns`);
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
                    <Link href={`/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/campaigns`}>
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
                                    <Label htmlFor="budget">Daily Budget (INR)</Label>
                                    <Input id="budget" name="budget" type="number" placeholder="e.g., 5000" required />
                                </div>
                            </div>

                             <div className="grid md:grid-cols-3 gap-6">
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
                                            numberOfMonths={2}
                                        />
                                        </PopoverContent>
                                    </Popover>
                                </div>
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