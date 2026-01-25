'use client';

import type { ReactNode } from 'react';
import { useContext } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider, SidebarContext } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

function CrmLayoutContent({ children }: { children: ReactNode }) {
  const { isManuallyToggled, isHovering } = useContext(SidebarContext);
  const isExpanded = isManuallyToggled || isHovering;
  
  return (
    <div className="bg-slate-50 dark:bg-zinc-900 min-h-screen w-full">
      <AppSidebar />
      <div className={cn(
        "flex flex-col h-screen transition-all duration-300 ease-in-out",
        "sm:pl-20", // Default collapsed width
        isExpanded && "sm:pl-56" // Expanded width
      )}>
        <div className="flex-shrink-0">
            <AppHeader />
        </div>
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-4 md:gap-8">
          <div className="flex flex-col gap-4 lg:gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <CrmLayoutContent>{children}</CrmLayoutContent>
    </SidebarProvider>
  );
}
