

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPageById, updatePage } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { Page } from '@/lib/types';
import PageForm from '@/components/cms/page-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCmsPage() {
    const router = useRouter();
    const params = useParams() as { role: string; encryptedUserId: string; pageId: string };
    const { toast } = useToast();

    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    
    const backUrl = `/u/app/${params.role}/${params.encryptedUserId}/cms/pages`;

    const fetchPage = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedPage = await getPageById(params.pageId);
            setPage(fetchedPage);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to fetch page', description: error.message });
            router.push(backUrl);
        } finally {
            setLoading(false);
        }
    }, [params.pageId, toast, router, backUrl]);
    
    useEffect(() => {
        fetchPage();
    }, [fetchPage]);


    const handleUpdatePage = async (pageData: Partial<Page>) => {
        setSubmitting(true);
        const { data, error } = await updatePage(params.pageId, pageData);

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to update page',
                description: error.message,
            });
        } else {
             toast({
                title: 'Page Updated',
                description: `The page "${data?.title}" has been successfully updated.`,
            });
            router.push(backUrl);
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="space-y-8">
                 <PageHeader title="Loading Page..." />
                 <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-40 w-full" />
                 </div>
            </div>
        )
    }
    
    if (!page) {
         return (
            <div className="flex flex-col items-center justify-center text-center py-10">
                 <p className="text-lg text-muted-foreground">Could not load page data.</p>
                 <Button asChild className="mt-4">
                    <Link href={backUrl}>Go Back</Link>
                 </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title={`Edit: ${page.title}`} description="Update your content page details.">
                <Button variant="outline" asChild>
                    <Link href={backUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Pages
                    </Link>
                </Button>
            </PageHeader>
            
            <PageForm
                initialData={page}
                onSubmit={handleUpdatePage}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
