import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div>
            <PageHeader title="Settings" description="Manage your account and application settings." />
            <Card>
                <CardContent className="pt-6">
                    <p>Settings page coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
