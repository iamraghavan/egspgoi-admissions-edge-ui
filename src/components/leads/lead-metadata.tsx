
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types";
import { format } from "date-fns";

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value || '-'}</dd>
    </div>
);

interface LeadMetadataProps {
    lead: Lead;
}

export function LeadMetadata({ lead }: LeadMetadataProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <DetailItem label="Lead ID" value={lead.lead_reference_id} />
                <DetailItem label="Source" value={lead.source_website} />
                <DetailItem label="Created" value={format(new Date(lead.created_at), 'PPpp')} />
                <DetailItem label="Last Contact" value={format(new Date(lead.last_contacted_at), 'PPpp')} />
            </CardContent>
        </Card>
    );
}
