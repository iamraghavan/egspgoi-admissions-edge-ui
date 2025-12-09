import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdSpends, getPaymentRecords } from '@/lib/data';
import DataTable from '@/components/leads/data-table';
import { paymentsColumns } from '@/components/accounting/payments-columns';
import { adSpendsColumns } from '@/components/accounting/ad-spends-columns';
import { PlusCircle } from 'lucide-react';

export default async function AccountingPage() {
  const payments = await getPaymentRecords();
  const adSpends = await getAdSpends();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Accounting" description="Manage payments and ad spends.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </PageHeader>
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment Records</TabsTrigger>
          <TabsTrigger value="adspends">Ad Spends</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-6">
          <DataTable 
            columns={paymentsColumns} 
            data={payments}
            searchKey="id"
            searchPlaceholder="Filter by ID..."
          />
        </TabsContent>
        <TabsContent value="adspends" className="mt-6">
          <DataTable 
            columns={adSpendsColumns} 
            data={adSpends}
            searchKey="id"
            searchPlaceholder="Filter by ID..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
