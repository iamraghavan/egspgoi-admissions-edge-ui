
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Site, Page } from '@/lib/types';
import { getSites, getPages, createPage, updatePage, deletePage } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { pagesColumns } from '@/components/cms/pages-columns';
import { PageFormDialog } from '@/components/cms/page-form-dialog';
import DataTable from '@/components/leads/data-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function CmsPagesPage() {
    const [sites, setSites] = useState<Site[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [loadingSites, setLoadingSites] = useState(true);
    const [loadingPages, setLoadingPages] = useState(false);

    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
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

    const fetchPages = useCallback(async () => {
        if (!selectedSiteId) return;
        setLoadingPages(true);
        try {
            const fetchedPages = await getPages(selectedSiteId);
            setPages(fetchedPages);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to fetch pages', description: error.message });
        } finally {
            setLoadingPages(false);
        }
    }, [toast, selectedSiteId]);

    useEffect(() => {
        if (selectedSiteId) {
            fetchPages();
        }
    }, [fetchPages, selectedSiteId]);

    const handleCreate = () => {
        if (!selectedSiteId) {
            toast({ variant: 'destructive', title: 'No Site Selected', description: 'Please select a site first.' });
            return;
        }
        setSelectedPage(null);
        setFormOpen(true);
    };

    const handleEdit = (page: Page) => {
        setSelectedPage(page);
        setFormOpen(true);
    };

    const handleDelete = (page: Page) => {
        setPageToDelete(page);
    };

    const confirmDelete = async () => {
        if (!pageToDelete) return;
        try {
            await deletePage(pageToDelete.id);
            toast({ title: 'Page Deleted', description: `${pageToDelete.title} has been successfully deleted.` });
            fetchPages();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
        } finally {
            setPageToDelete(null);
        }
    };

    const handleFormSubmit = async (pageData: Partial<Page>) => {
        try {
            if (selectedPage) {
                await updatePage(selectedPage.id, pageData);
                toast({ title: 'Page Updated', description: 'Page details saved successfully.' });
            } else {
                if (!selectedSiteId) throw new Error("Site ID is required to create a page.");
                await createPage({ ...pageData, site_id: selectedSiteId });
                toast({ title: 'Page Created', description: 'New page has been created.' });
            }
            fetchPages();
            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: selectedPage ? 'Update Failed' : 'Creation Failed',
                description: error.message,
            });
            return false;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="CMS Pages" description="Manage content pages for each site.">
                <Button onClick={handleCreate} disabled={!selectedSiteId}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Page
                </Button>
            </PageHeader>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label>Select a site to manage its pages</Label>
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
                    columns={pagesColumns} 
                    data={pages}
                    loading={loadingPages}
                    searchKey="title"
                    searchPlaceholder="Filter by page title..."
                    meta={{
                        onEdit: handleEdit,
                        onDelete: handleDelete,
                    }}
                />
            ) : !loadingSites && (
                 <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                    <h3 className="text-xl font-semibold">No Site Selected</h3>
                    <p className="text-muted-foreground mt-2">Please select or create a site to manage pages.</p>
                </div>
            )}
           
            <PageFormDialog
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                page={selectedPage}
                siteId={selectedSiteId}
                onSubmit={handleFormSubmit}
            />
            {pageToDelete && (
                <ConfirmationDialog
                    isOpen={!!pageToDelete}
                    onOpenChange={(isOpen) => !isOpen && setPageToDelete(null)}
                    onConfirm={confirmDelete}
                    title={`Delete Page: ${pageToDelete.title}`}
                    description="Are you sure you want to permanently delete this page? This action is irreversible."
                    confirmText="Permanently Delete"
                />
            )}
        </div>
    );
}
