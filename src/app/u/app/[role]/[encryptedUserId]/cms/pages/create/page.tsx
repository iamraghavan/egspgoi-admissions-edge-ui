
'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createPage } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Page } from '@/lib/types';
import PageForm from '@/components/cms/page-form';

export default function CreateCmsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isSubmitting, setSubmitting] = useState(false);
    
    const siteId = searchParams.get('siteId');
    const backUrl = `/u/app/${params.role}/${params.encryptedUserId}/cms/pages`;

    const handleCreatePage = async (pageData: Partial<Page>) => {
        if (!siteId) {
            toast({
                variant: 'destructive',
                title: 'Site ID is missing',
                description: 'Cannot create a page without a site context.',
            });
            return;
        }

        setSubmitting(true);
        try {
            await createPage({ ...pageData, site_id: siteId });
            toast({
                title: 'Page Created',
                description: `The page "${pageData.title}" has been successfully created.`,
            });
            router.push(backUrl);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to create page',
                description: error.message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!siteId) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10">
                 <p className="text-lg text-muted-foreground">Site ID is missing from the URL.</p>
                 <Button asChild className="mt-4">
                    <Link href={backUrl}>Go Back</Link>
                 </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Create New Page" description="Fill in the details for your new content page.">
                <Button variant="outline" asChild>
                    <Link href={backUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Pages
                    </Link>
                </Button>
            </PageHeader>
            
            <PageForm
                onSubmit={handleCreatePage}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
