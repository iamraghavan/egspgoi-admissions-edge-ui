
import PageHeader from "@/components/page-header";

export default function CmsPagesPage() {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader 
                title="CMS Pages"
                description="Manage static pages for your sites."
            />
            <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                <h3 className="text-xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">Page management functionality will be available here.</p>
            </div>
        </div>
    );
}
