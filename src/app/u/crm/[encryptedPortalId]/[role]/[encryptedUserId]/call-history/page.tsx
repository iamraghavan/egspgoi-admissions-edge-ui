
import PageHeader from "@/components/page-header";
import DataTable from "@/components/leads/data-table";
import { getCalls } from "@/lib/data";
import { callHistoryColumns } from "@/components/calls/history-columns";

export default async function CallHistoryPage() {
    const calls = await getCalls();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Call History" description="Review past call recordings and details." />
            <DataTable
                columns={callHistoryColumns}
                data={calls}
                searchKey="id"
                searchPlaceholder="Filter by call ID..."
            />
        </div>
    );
}
