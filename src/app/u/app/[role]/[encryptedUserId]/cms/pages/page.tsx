
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function CmsPagesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="CMS Pages" description="Manage content pages for your sites.">
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </PageHeader>
      <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
        <h3 className="text-xl font-semibold">Pages Management Coming Soon</h3>
        <p className="text-muted-foreground mt-2">This section is under construction.</p>
      </div>
    </div>
  );
}
