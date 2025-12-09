import PageHeader from "@/components/page-header";
import LiveCallCard from "@/components/calls/live-call-card";
import { getLiveCalls } from "@/lib/data";

export default async function CallMonitoringPage() {
    const liveCalls = await getLiveCalls();

    return (
        <div>
            <PageHeader title="Live Call Monitoring" description="Monitor active calls in real-time." />
            {liveCalls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveCalls.map((call) => (
                        <LiveCallCard key={call.callId} call={call} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No active calls right now.</p>
                </div>
            )}
        </div>
    );
}
