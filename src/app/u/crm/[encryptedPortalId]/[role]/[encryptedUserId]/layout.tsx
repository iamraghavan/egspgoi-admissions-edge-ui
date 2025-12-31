import type { ReactNode } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-muted/40 min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 h-screen overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex flex-col gap-4 lg:gap-6 h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
