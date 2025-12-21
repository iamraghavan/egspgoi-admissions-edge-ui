
import PageHeader from "@/components/page-header";
import DataTable from "@/components/leads/data-table";
import { budgetColumns } from "@/components/budgets/columns";
import { getBudgetRequests } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { BudgetRequest } from "@/lib/types";

export default async function BudgetApprovalsPage() {
    const allRequests = await getBudgetRequests();
    const pendingRequests = allRequests.filter(req => req.status === "Pending");
    
    // In a real app, this would be filtered based on the current user
    const myRequests = allRequests.filter(req => req.submittedBy === 'user-3');

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Budget Approvals" description="Review and approve campaign budgets.">
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Request Budget
                </Button>
            </PageHeader>
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
                    <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    <DataTable 
                        columns={budgetColumns} 
                        data={pendingRequests as BudgetRequest[]} 
                        searchKey="campaignId"
                        searchPlaceholder="Filter by campaign..."
                    />
                </TabsContent>
                <TabsContent value="my-requests" className="mt-6">
                    <DataTable 
                        columns={budgetColumns} 
                        data={myRequests as BudgetRequest[]}
                        searchKey="campaignId"
                        searchPlaceholder="Filter by campaign..."
                    />
                </TabsContent>
                <TabsContent value="all" className="mt-6">
                    <DataTable 
                        columns={budgetColumns} 
                        data={allRequests as BudgetRequest[]}
                        searchKey="campaignId"
                        searchPlaceholder="Filter by campaign..."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
