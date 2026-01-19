

'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { useEffect, useState, useContext } from 'react';
import { getProfile } from '@/lib/auth';
import { Skeleton } from '../ui/skeleton';
import type { User } from '@/lib/types';
import { SidebarContext } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { PanelLeft, PanelRight } from 'lucide-react';
import { UserNav } from './user-nav';

export default function AppSidebar() {
  const { isManuallyToggled, isHovering, setManuallyToggled, setHovering } = useContext(SidebarContext);
  const isExpanded = isManuallyToggled || isHovering;

  return (
    <aside 
        className={cn(
            "fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out sm:flex",
            isExpanded ? "w-56" : "w-14"
        )}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
    >
       <div className={cn("flex h-14 items-center border-b px-4", !isExpanded && "justify-center")}>
            <Link href="/" className={cn("flex items-center gap-2 font-semibold", !isExpanded ? "w-full justify-center" : "")}>
              <AppLogo className="h-6 w-6 text-primary shrink-0" />
              <span className={cn("truncate", !isExpanded && "sr-only")}>Admissions Edge</span>
            </Link>
            <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-8 w-8 ml-auto", !isExpanded && "hidden")}
                onClick={() => setManuallyToggled(!isManuallyToggled)}
            >
                <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Nav />
          </div>
          <div className="mt-auto flex flex-col items-center gap-4 px-2 py-4 border-t">
             <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-8 w-8", isExpanded && "hidden")}
                onClick={() => setManuallyToggled(!isManuallyToggled)}
            >
                <PanelRight className="h-5 w-5" />
            </Button>
            <UserNav isCollapsed={!isExpanded}/>
          </div>
    </aside>
  );
}

