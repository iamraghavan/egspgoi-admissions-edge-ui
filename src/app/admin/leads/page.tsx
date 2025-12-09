import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLeads } from '@/lib/data';
import LeadsDataTable from '@/components/leads/data-table';
import { leadColumns } from '@/components/leads/columns';
import KanbanBoard from '@/components/leads/kanban-board';
import { PlusCircle } from 'lucide-react';

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Leads" description="Manage and track all your prospective students.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Lead
        </Button>
      </PageHeader>
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Kanban Board</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-6">
          <KanbanBoard />
        </TabsContent>
        <TabsContent value="table">
          <LeadsDataTable 
            columns={leadColumns} 
            data={leads}
            searchKey="name"
            searchPlaceholder="Filter leads by name..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
