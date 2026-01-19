
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import type { Page } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface PageFormProps {
    initialData?: Page;
    onSubmit: (data: Partial<Page>) => Promise<void>;
    isSubmitting: boolean;
}

const formSchema = z.object({
  title: z.string().min(1, "Page title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  main_image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  location: z.enum(['header', 'footer', 'none']),
  status: z.enum(['published', 'draft']),
  seo: z.object({
      meta_title: z.string().optional(),
      meta_description: z.string().optional(),
      og_image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  }),
});

export default function PageForm({ initialData, onSubmit, isSubmitting }: PageFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            main_image: initialData.main_image || '',
            seo: {
                meta_title: initialData.seo?.meta_title || '',
                meta_description: initialData.seo?.meta_description || '',
                og_image: initialData.seo?.og_image || '',
            }
        } : {
            title: '',
            slug: '',
            content: '',
            main_image: '',
            location: 'none',
            status: 'draft',
            seo: {
                meta_title: '',
                meta_description: '',
                og_image: '',
            }
        }
    });

    const titleValue = form.watch('title');

    useEffect(() => {
        if (!initialData || !form.getValues('slug')) { // Only auto-slugify on creation or if slug is empty
            form.setValue('slug', slugify(titleValue));
        }
    }, [titleValue, form, initialData]);


    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        await onSubmit(values);
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} placeholder="e.g., About Us" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} placeholder="e.g., about-us" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem><FormLabel>Content (HTML supported)</FormLabel><FormControl><Textarea rows={10} {...field} placeholder="<h1>My Page</h1><p>Some content here...</p>" /></FormControl><FormMessage /></FormItem>
                            )}/>

                            <FormField control={form.control} name="main_image" render={({ field }) => (
                                <FormItem><FormLabel>Main Image URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com/image.jpg" /></FormControl><FormMessage /></FormItem>
                            )}/>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem><FormLabel>Display Location</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="header">Header</SelectItem><SelectItem value="footer">Footer</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-4 border-b pb-2">SEO Settings</h3>
                                <div className="space-y-4">
                                <FormField control={form.control} name="seo.meta_title" render={({ field }) => (
                                        <FormItem><FormLabel>Meta Title</FormLabel><FormControl><Input {...field} placeholder="e.g. About Us | My Awesome Site" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="seo.meta_description" render={({ field }) => (
                                        <FormItem><FormLabel>Meta Description</FormLabel><FormControl><Textarea rows={2} {...field} placeholder="A short description for search engines." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="seo.og_image" render={({ field }) => (
                                        <FormItem><FormLabel>Social Share Image (og:image) URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com/social-image.jpg" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                        Reset
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Save Changes' : 'Create Page'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
