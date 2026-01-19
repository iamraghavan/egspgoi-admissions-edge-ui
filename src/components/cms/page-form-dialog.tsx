
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Page } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface PageFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: Partial<Page>) => Promise<boolean>;
    page: Partial<Page> | null;
    siteId: string | null;
}

const formSchema = z.object({
  title: z.string().min(1, "Page title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  location: z.enum(['header', 'footer', 'none']),
  status: z.enum(['published', 'draft']),
  seo: z.object({
      meta_title: z.string().optional(),
      meta_description: z.string().optional(),
  }),
});

export function PageFormDialog({ isOpen, onOpenChange, onSubmit, page, siteId }: PageFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            slug: '',
            content: '',
            location: 'none',
            status: 'draft',
            seo: {
                meta_title: '',
                meta_description: '',
            }
        }
    });

    const titleValue = form.watch('title');

    useEffect(() => {
        if (!page?.id || !form.getValues('slug')) {
            form.setValue('slug', slugify(titleValue));
        }
    }, [titleValue, form, page]);

    useEffect(() => {
        if (isOpen) {
            if (page) {
                form.reset({
                    title: page.title || '',
                    slug: page.slug || '',
                    content: page.content || '',
                    location: page.location || 'none',
                    status: page.status || 'draft',
                    seo: {
                        meta_title: page.seo?.meta_title || '',
                        meta_description: page.seo?.meta_description || '',
                    }
                });
            } else {
                form.reset({
                    title: '',
                    slug: '',
                    content: '',
                    location: 'none',
                    status: 'draft',
                    seo: {
                        meta_title: '',
                        meta_description: '',
                    }
                });
            }
        }
    }, [page, form, isOpen]);

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!siteId) {
            form.setError('title', { type: 'manual', message: 'A site must be selected first.' });
            return;
        }
        setIsSubmitting(true);
        const success = await onSubmit({ ...values, site_id: siteId });
        if (success) {
            onOpenChange(false);
        }
        setIsSubmitting(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{page?.id ? 'Edit Page' : 'Create New Page'}</DialogTitle>
                    <DialogDescription>
                        {page?.id ? `Update the details for ${page.title}.` : 'Fill in the form to create a new page.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} placeholder="e.g., About Us" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="slug" render={({ field }) => (
                                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} placeholder="e.g., about-us" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        
                        <FormField control={form.control} name="content" render={({ field }) => (
                            <FormItem><FormLabel>Content (HTML supported)</FormLabel><FormControl><Textarea rows={8} {...field} placeholder="<h1>My Page</h1>" /></FormControl><FormMessage /></FormItem>
                        )}/>

                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Display Location</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="header">Header</SelectItem><SelectItem value="footer">Footer</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>

                         <div>
                            <h3 className="text-md font-medium mb-2 border-b pb-2">SEO Settings</h3>
                            <div className="grid md:grid-cols-1 gap-4 mt-4">
                               <FormField control={form.control} name="seo.meta_title" render={({ field }) => (
                                    <FormItem><FormLabel>Meta Title</FormLabel><FormControl><Input {...field} placeholder="e.g. About Us | My Awesome Site" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="seo.meta_description" render={({ field }) => (
                                    <FormItem><FormLabel>Meta Description</FormLabel><FormControl><Textarea rows={2} {...field} placeholder="A short description for search engines." /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {page?.id ? 'Save Changes' : 'Create Page'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

