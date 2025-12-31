
'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { useEffect, useState, useContext } from 'react';
import { getProfile, logout } from '@/lib/auth';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { SidebarContext } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { PanelLeftClose, PanelRightClose, PanelLeftOpen } from 'lucide-react';
import { UserNav } from './user-nav';


export function AppSidebarContent({ isMobile = false }: { isMobile?: boolean }) {
    const router = useRouter();
    const appVersion = "0.1.0"; 
    const [user, setUser] = useState<User | null>(null);
    const { isManuallyToggled, setManuallyToggled } = useContext(SidebarContext);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    useEffect(() => {
        async function fetchProfile() {
        try {
            const profile = await getProfile();
            if (profile) {
                setUser(profile);
            } else {
                handleLogout();
            }
        } catch (error) {
            console.error("Failed to fetch user profile for sidebar", error);
            handleLogout();
        }
        }
        fetchProfile();
    }, []);

    return (
        <div className={cn("flex h-full max-h-screen flex-col", isMobile && "w-full")}>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                 <Link href="/" className="flex items-center gap-2 font-semibold">
                    <AppLogo className="h-6 w-6 text-primary" />
                    <span className="">Admissions Edge</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
                <Nav isMobile={isMobile} />
            </div>
            <div className="mt-auto p-4">
                <Separator className='mb-4' />
                <div className='flex items-center justify-between'>
                    {user ? (
                        <div className='flex items-center gap-2'>
                             <span className='text-sm font-medium leading-none'>{user.name}</span>
                             <span className='text-xs text-muted-foreground'>v{appVersion}</span>
                        </div>
                    ) : (
                         <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

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
       <div className={cn("flex h-14 items-center border-b px-4", isExpanded ? "justify-between" : "justify-center")}>
            <Link href="/" className={cn("flex items-center gap-2 font-semibold", !isExpanded && "sr-only")}>
              <AppLogo className="h-6 w-6 text-primary" />
              <span>Admissions Edge</span>
            </Link>
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setManuallyToggled(!isManuallyToggled)}
            >
                {isExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
            </Button>
          </div>
          <Nav />
          <div className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
            <UserNav isCollapsed={!isExpanded}/>
          </div>
    </aside>
  );
}
