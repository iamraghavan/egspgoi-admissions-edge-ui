'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/icons';
import Nav from './nav';
import { UserNav } from './user-nav';

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <div className="flex h-full flex-col">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <AppLogo className="w-8 h-8 text-accent" />
            <span className="text-lg font-semibold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Admissions Edge
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <Nav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
          <div className="group-data-[collapsible=icon]:hidden">
            <UserNav />
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
