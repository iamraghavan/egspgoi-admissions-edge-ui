

'use client';

import type { ReactNode } from 'react';
import { useContext, useEffect } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { SidebarProvider, SidebarContext } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import InfoMarquee from '@/components/layout/info-marquee';
import { SessionTimeoutProvider, useSessionTimeout } from '@/hooks/use-session-timeout';
import { SessionTimeoutDialog } from '@/components/auth/session-timeout-dialog';
import { setSessionTimeoutContext } from '@/lib/session-context';
import { initializeSessionTimer } from '@/lib/session-timer';

function CrmLayoutContent({ children }: { children: ReactNode }) {
  const { isManuallyToggled, isHovering } = useContext(SidebarContext);
  const isExpanded = isManuallyToggled || isHovering;
  
  // Connect the session timeout context to the non-React world
  const sessionTimeout = useSessionTimeout();
  setSessionTimeoutContext(sessionTimeout);

  useEffect(() => {
    // Initialize the session timer when the main layout mounts
    initializeSessionTimer();
  }, []);

  return (
    <div className="bg-muted/40 min-h-screen w-full">
      <AppSidebar />
      <div className={cn(
        "flex flex-col h-screen transition-all duration-300 ease-in-out",
        "sm:pl-14", // Default collapsed width
        isExpanded && "sm:pl-56" // Expanded width
      )}>
        <InfoMarquee />
        <div className="flex-shrink-0">
            <AppHeader />
        </div>
        <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-4 md:gap-8">
          <div className="flex flex-col gap-4 lg:gap-6 h-full">
            {children}
          </div>
        </main>
      </div>
      <SessionTimeoutDialog />
    </div>
  )
}

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <SessionTimeoutProvider>
        <CrmLayoutContent>{children}</CrmLayoutContent>
      </SessionTimeoutProvider>
    </SidebarProvider>
  );
}
