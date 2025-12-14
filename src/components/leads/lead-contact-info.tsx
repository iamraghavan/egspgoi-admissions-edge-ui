
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types";

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value || '-'}</dd>
    </div>
);

interface LeadContactInfoProps {
    lead: Lead;
}

export function LeadContactInfo({ lead }: LeadContactInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <DetailItem label="Email" value={<a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>} />
                <DetailItem label="Phone" value={<a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>} />
                <DetailItem label="Location" value={lead.district && lead.state ? `${lead.district}, ${lead.state}` : 'N/A'} />
            </CardContent>
        </Card>
    );
}
