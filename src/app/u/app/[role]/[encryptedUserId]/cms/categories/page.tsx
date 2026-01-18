
import PageHeader from "@/components/page-header";

export default function CmsCategoriesPage() {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader 
                title="CMS Categories"
                description="Organize your content with categories."
            />
            <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                <h3 className="text-xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">Category management functionality will be available here.</p>
            </div>
        </div>
    );
}
