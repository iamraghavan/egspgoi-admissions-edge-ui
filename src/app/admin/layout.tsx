import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
