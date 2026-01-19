
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Site, Category } from '@/lib/types';
import { getSites, getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { categoriesColumns } from '@/components/cms/categories-columns';
import { CategoryFormDialog } from '@/components/cms/category-form-dialog';
import DataTable from '@/components/leads/data-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function CmsCategoriesPage() {
    const [sites, setSites] = useState<Site[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingSites, setLoadingSites] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const { toast } = useToast();

    const fetchSites = useCallback(async () => {
        setLoadingSites(true);
        try {
            const fetchedSites = await getSites();
            setSites(fetchedSites);
            if (fetchedSites.length > 0) {
                setSelectedSiteId(fetchedSites[0].id);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to fetch sites', description: error.message });
        } finally {
            setLoadingSites(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    const fetchCategories = useCallback(async () => {
        if (!selectedSiteId) return;
        setLoadingCategories(true);
        try {
            const fetchedCategories = await getCategories(selectedSiteId);
            setCategories(fetchedCategories);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to fetch categories', description: error.message });
        } finally {
            setLoadingCategories(false);
        }
    }, [toast, selectedSiteId]);

    useEffect(() => {
        if (selectedSiteId) {
            fetchCategories();
        }
    }, [fetchCategories, selectedSiteId]);

    const handleCreate = () => {
        if (!selectedSiteId) {
            toast({ variant: 'destructive', title: 'No Site Selected', description: 'Please select a site first.' });
            return;
        }
        setSelectedCategory(null);
        setFormOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormOpen(true);
    };

    const handleDelete = (category: Category) => {
        setCategoryToDelete(category);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.id);
            toast({ title: 'Category Deleted', description: `${categoryToDelete.name} has been successfully deleted.` });
            fetchCategories();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
        } finally {
            setCategoryToDelete(null);
        }
    };

    const handleFormSubmit = async (categoryData: Partial<Category>) => {
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory.id, categoryData);
                toast({ title: 'Category Updated', description: 'Category details saved successfully.' });
            } else {
                if (!siteId) throw new Error("Site ID is required to create a category.");
                await createCategory({ ...categoryData, site_id: siteId });
                toast({ title: 'Category Created', description: 'New category has been created.' });
            }
            fetchCategories();
            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: selectedCategory ? 'Update Failed' : 'Creation Failed',
                description: error.message,
            });
            return false;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="CMS Categories" description="Group your content into logical categories for each site.">
                <Button onClick={handleCreate} disabled={!selectedSiteId}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Category
                </Button>
            </PageHeader>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label>Select a site to manage its categories</Label>
                {loadingSites ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select onValueChange={setSelectedSiteId} value={selectedSiteId || ''} disabled={sites.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a site..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sites.map(site => (
                                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {selectedSiteId ? (
                 <DataTable 
                    columns={categoriesColumns} 
                    data={categories}
                    loading={loadingCategories}
                    searchKey="name"
                    searchPlaceholder="Filter by category name..."
                    meta={{
                        onEdit: handleEdit,
                        onDelete: handleDelete,
                    }}
                />
            ) : !loadingSites && (
                 <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                    <h3 className="text-xl font-semibold">No Site Selected</h3>
                    <p className="text-muted-foreground mt-2">Please select or create a site to manage categories.</p>
                </div>
            )}
           
            <CategoryFormDialog
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                category={selectedCategory}
                siteId={selectedSiteId}
                onSubmit={handleFormSubmit}
            />
            {categoryToDelete && (
                <ConfirmationDialog
                    isOpen={!!categoryToDelete}
                    onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}
                    onConfirm={confirmDelete}
                    title={`Delete Category: ${categoryToDelete.name}`}
                    description="Are you sure you want to permanently delete this category? This action is irreversible."
                    confirmText="Permanently Delete"
                />
            )}
        </div>
    );
}
