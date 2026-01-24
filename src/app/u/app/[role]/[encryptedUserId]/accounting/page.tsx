'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdSpends, getPaymentRecords } from '@/lib/data';
import DataTable from '@/components/leads/data-table';
import { paymentsColumns } from '@/components/accounting/payments-columns';
import { adSpendsColumns } from '@/components/accounting/ad-spends-columns';
import { PlusCircle } from 'lucide-react';
import type { PaymentRecord, AdSpend } from '@/lib/types';
import { AddPaymentForm } from '@/components/accounting/add-payment-form';
import { AddAdSpendForm } from '@/components/accounting/add-ad-spend-form';

export default function AccountingPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [adSpends, setAdSpends] = useState<AdSpend[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPaymentFormOpen, setPaymentFormOpen] = useState(false);
  const [isAdSpendFormOpen, setAdSpendFormOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsData, adSpendsData] = await Promise.all([
        getPaymentRecords(),
        getAdSpends(),
      ]);
      setPayments(paymentsData);
      setAdSpends(adSpendsData);
    } catch (error) {
      console.error("Failed to fetch accounting data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Accounting" description="Manage payments and ad spends.">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setPaymentFormOpen(true)}>
              Add Payment Record
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAdSpendFormOpen(true)}>
              Add Ad Spend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            loading={loading}
            searchKey="purpose"
            searchPlaceholder="Filter by purpose..."
          />
        </TabsContent>
        <TabsContent value="adspends" className="mt-6">
          <DataTable
            columns={adSpendsColumns}
            data={adSpends}
            loading={loading}
            searchKey="campaign_name"
            searchPlaceholder="Filter by campaign..."
          />
        </TabsContent>
      </Tabs>
      <AddPaymentForm
        isOpen={isPaymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        onSuccess={fetchData}
      />
      <AddAdSpendForm
        isOpen={isAdSpendFormOpen}
        onOpenChange={setAdSpendFormOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
