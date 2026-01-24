'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from "@/components/page-header";
import DataTable from "@/components/leads/data-table";
import { budgetColumns } from "@/components/budgets/columns";
import { getBudgetRequests, updateBudgetStatus } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BudgetRequest } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { getProfile } from '@/lib/auth';

export default function BudgetApprovalsPage() {
    const [allRequests, setAllRequests] = useState<BudgetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      getProfile().then(profile => {
        if(profile) setUserId(profile.id);
      })
    }, []);

    const fetchBudgets = useCallback(async () => {
      setLoading(true);
      try {
        const requests = await getBudgetRequests();
        setAllRequests(requests);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to fetch budget requests",
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    }, [toast]);
    
    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const handleStatusUpdate = async (budgetId: string, status: 'approved' | 'rejected') => {
        try {
            await updateBudgetStatus(budgetId, status);
            toast({
                title: `Budget ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                description: `The budget request has been successfully ${status}.`,
            });
            fetchBudgets();
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message
            });
        }
    }

    const pendingRequests = allRequests.filter(req => req.status === "pending");
    const myRequests = userId ? allRequests.filter(req => req.submitted_by === userId) : [];

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Budget Approvals" description="Review and approve campaign budgets." />
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
                    <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    <DataTable 
                        columns={budgetColumns} 
                        data={pendingRequests as BudgetRequest[]} 
                        loading={loading}
                        searchKey="campaign_name"
                        searchPlaceholder="Filter by campaign..."
                        meta={{
                            onApprove: (id: string) => handleStatusUpdate(id, 'approved'),
                            onReject: (id: string) => handleStatusUpdate(id, 'rejected'),
                        }}
                    />
                </TabsContent>
                <TabsContent value="my-requests" className="mt-6">
                    <DataTable 
                        columns={budgetColumns} 
                        data={myRequests as BudgetRequest[]}
                        loading={loading}
                        searchKey="campaign_name"
                        searchPlaceholder="Filter by campaign..."
                    />
                </TabsContent>
                <TabsContent value="all" className="mt-6">
                    <DataTable 
                        columns={budgetColumns} 
                        data={allRequests as BudgetRequest[]}
                        loading={loading}
                        searchKey="campaign_name"
                        searchPlaceholder="Filter by campaign..."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
