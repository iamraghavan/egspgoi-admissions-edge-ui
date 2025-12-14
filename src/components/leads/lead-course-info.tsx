
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types";

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value || '-'}</dd>
    </div>
);

interface LeadCourseInfoProps {
    lead: Lead;
}

export function LeadCourseInfo({ lead }: LeadCourseInfoProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <DetailItem label="College" value={lead.college} />
                <DetailItem label="Course" value={lead.course} />
                <DetailItem label="Admission Year" value={lead.admission_year} />
            </CardContent>
        </Card>
    );
}
