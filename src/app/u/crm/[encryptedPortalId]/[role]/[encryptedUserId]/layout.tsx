import type { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AppSidebar />
        <div className="flex flex-col h-screen overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/40">
            <div className="flex flex-col gap-4 lg:gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
