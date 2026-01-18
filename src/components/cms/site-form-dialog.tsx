

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Site } from '@/lib/types';

interface SiteFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: Partial<Site>) => Promise<boolean | Site>;
    site: Site | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  domain: z.string().min(1, "Domain is required").refine(val => /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(val), {
      message: "Please enter a valid domain name (e.g., example.com)"
  }),
  settings: z.object({
    theme_color: z.string().optional(),
    logo: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  }),
  seo_global: z.object({
    title_suffix: z.string().optional().or(z.literal('')),
  }),
});

export function SiteFormDialog({ isOpen, onOpenChange, onSubmit, site }: SiteFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (site) {
                form.reset({
                    name: site.name || '',
                    domain: site.domain || '',
                    settings: {
                        theme_color: site.settings?.theme_color || '#000000',
                        logo: site.settings?.logo || '',
                    },
                    seo_global: {
                        title_suffix: site.seo_global?.title_suffix || '',
                    },
                });
            } else {
                form.reset({
                    name: '',
                    domain: '',
                    settings: { theme_color: '#000000', logo: '' },
                    seo_global: { title_suffix: '' },
                });
            }
        }
    }, [site, form, isOpen]);

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const success = await onSubmit(values);
        if (success) {
            onOpenChange(false);
        }
        setIsSubmitting(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{site ? 'Edit Site' : 'Create New Site'}</DialogTitle>
                    <DialogDescription>
                        {site ? `Update the details for ${site.name}.` : 'Fill in the form to create a new headless site.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} placeholder="My Awesome Blog" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="domain" render={({ field }) => (
                                <FormItem><FormLabel>Domain</FormLabel><FormControl><Input {...field} placeholder="blog.example.com" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        
                        <div>
                            <h3 className="text-md font-medium mb-2 border-b pb-2">Customization</h3>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                               <FormField control={form.control} name="settings.theme_color" render={({ field }) => (
                                    <FormItem><FormLabel>Theme Color</FormLabel><FormControl><Input type="color" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="settings.logo" render={({ field }) => (
                                    <FormItem><FormLabel>Logo URL (Optional)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-md font-medium mb-2 border-b pb-2">SEO</h3>
                            <div className="grid md:grid-cols-1 gap-4 mt-4">
                               <FormField control={form.control} name="seo_global.title_suffix" render={({ field }) => (
                                    <FormItem><FormLabel>Title Suffix</FormLabel><FormControl><Input {...field} placeholder="e.g. | My Awesome Blog" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>
                        
                        <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {site ? 'Save Changes' : 'Create Site'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
