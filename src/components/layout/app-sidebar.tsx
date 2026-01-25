

'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';
import { useContext } from 'react';
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
            "fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-black/20 bg-[#57002f] text-gray-300 transition-all duration-300 ease-in-out sm:flex",
            isExpanded ? "w-56" : "w-20"
        )}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
    >
       <div className={cn("flex h-16 items-center border-b border-black/20 px-4", !isExpanded && "justify-center")}>
            <Link href="/" className={cn("flex items-center gap-2 font-semibold text-white", !isExpanded ? "w-full justify-center" : "")}>
              <AppLogo className="h-8 w-8 shrink-0" />
              <span className={cn("truncate", !isExpanded && "sr-only")}>Admissions Edge</span>
            </Link>
            <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-8 w-8 ml-auto text-white hover:bg-white/10 hover:text-white", !isExpanded && "hidden")}
                onClick={() => setManuallyToggled(!isManuallyToggled)}
            >
                <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Nav />
          </div>
          <div className="mt-auto flex flex-col items-center gap-4 px-2 py-2 border-t border-black/20">
             <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-8 w-8 text-white hover:bg-white/10 hover:text-white", isExpanded && "hidden")}
                onClick={() => setManuallyToggled(!isManuallyToggled)}
            >
                <PanelRight className="h-5 w-5" />
            </Button>
            <div className="w-full">
                <UserNav isCollapsed={!isExpanded}/>
            </div>
          </div>
    </aside>
  );
}
