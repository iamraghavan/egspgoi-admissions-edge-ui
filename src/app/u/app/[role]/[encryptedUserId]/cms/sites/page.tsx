
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Site } from '@/lib/types';
import { getSites, createSite, updateSite, deleteSite } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { siteColumns } from '@/components/cms/sites-columns';
import { SiteFormDialog } from '@/components/cms/site-form-dialog';
import DataTable from '@/components/leads/data-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function CmsSitesPage() {
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
    const { toast } = useToast();

    const fetchSites = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedSites = await getSites();
            setSites(fetchedSites);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to fetch sites',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    const handleCreate = () => {
        setSelectedSite(null);
        setFormOpen(true);
    };

    const handleEdit = (site: Site) => {
        setSelectedSite(site);
        setFormOpen(true);
    };

    const handleDelete = (site: Site) => {
        setSiteToDelete(site);
    };

    const confirmDelete = async () => {
        if (!siteToDelete) return;
        try {
            await deleteSite(siteToDelete.id);
            toast({
                title: 'Site Deleted',
                description: `${siteToDelete.name} has been successfully deleted.`,
            });
            fetchSites();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Delete Failed',
                description: error.message,
            });
        } finally {
            setSiteToDelete(null);
        }
    };

    const handleFormSubmit = async (siteData: Partial<Site>) => {
        try {
            if (selectedSite) {
                await updateSite(selectedSite.id, siteData);
                toast({ title: 'Site Updated', description: 'Site details saved successfully.' });
            } else {
                await createSite(siteData);
                toast({ title: 'Site Created', description: 'New site has been created.' });
            }
            fetchSites();
            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: selectedSite ? 'Update Failed' : 'Creation Failed',
                description: error.message,
            });
            return false;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="CMS Sites" description="Manage all websites powered by the headless CMS.">
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Site
                </Button>
            </PageHeader>
            <DataTable 
                columns={siteColumns} 
                data={sites}
                loading={loading}
                searchKey="name"
                searchPlaceholder="Filter by site name or domain..."
                meta={{
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                }}
            />
            <SiteFormDialog
                isOpen={isFormOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
                site={selectedSite}
            />
            {siteToDelete && (
                <ConfirmationDialog
                    isOpen={!!siteToDelete}
                    onOpenChange={(isOpen) => !isOpen && setSiteToDelete(null)}
                    onConfirm={confirmDelete}
                    title={`Delete Site: ${siteToDelete.name}`}
                    description="Are you sure you want to permanently delete this site and all of its associated content (pages, posts, etc)? This action is irreversible."
                    confirmText="Permanently Delete"
                />
            )}
        </div>
    );
}
