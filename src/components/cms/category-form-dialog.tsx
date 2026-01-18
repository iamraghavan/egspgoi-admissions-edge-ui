'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';


interface CategoryFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: Partial<Category>) => Promise<boolean>;
    category: Partial<Category> | null;
    siteId: string | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  order: z.coerce.number().min(0, "Order must be a positive number"),
  show_on_menu: z.boolean(),
});

export function CategoryFormDialog({ isOpen, onOpenChange, onSubmit, category, siteId }: CategoryFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
            order: 0,
            show_on_menu: true,
        }
    });
    
    const nameValue = form.watch('name');

    useEffect(() => {
        if (!category?.id || !form.getValues('slug')) { // Only auto-slugify if slug is empty or it's a new category
             form.setValue('slug', slugify(nameValue));
        }
    }, [nameValue, form, category]);

    useEffect(() => {
        if (isOpen) {
            if (category) {
                form.reset({
                    name: category.name || '',
                    slug: category.slug || '',
                    order: category.order || 0,
                    show_on_menu: category.show_on_menu === undefined ? true : category.show_on_menu,
                });
            } else {
                form.reset({
                    name: '',
                    slug: '',
                    order: 0,
                    show_on_menu: true,
                });
            }
        }
    }, [category, form, isOpen]);

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!siteId) {
            form.setError('name', { type: 'manual', message: 'A site must be selected first.' });
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
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{category?.id ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    <DialogDescription>
                        {category?.id ? `Update the details for ${category.name}.` : 'Fill in the form to create a new category.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Artificial Intelligence" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="slug" render={({ field }) => (
                                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} placeholder="e.g., artificial-intelligence" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="order" render={({ field }) => (
                                <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField
                                control={form.control}
                                name="show_on_menu"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Show on Menu</FormLabel>
                                        <FormControl>
                                            <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="mt-2"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {category?.id ? 'Save Changes' : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
