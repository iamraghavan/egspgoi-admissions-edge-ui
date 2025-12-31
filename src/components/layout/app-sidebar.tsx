
'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export function AppSidebarContent() {
    const router = useRouter();
    const appVersion = "0.1.0"; 
    const [user, setUser] = useState<User | null>(null);

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
        <>
            <div className="flex-1 overflow-y-auto">
                <Nav isMobile={true} />
            </div>
            <div className="mt-auto p-4 space-y-4">
                <Separator />
                <div className='flex items-center gap-3'>
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>
                        {user ? user.name.charAt(0).toUpperCase() : <Skeleton className="h-10 w-10 rounded-full" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        {user ? (
                        <>
                            <span className='text-sm font-medium leading-none'>{user.name}</span>
                            <span className='text-xs text-muted-foreground'>v{appVersion}</span>
                        </>
                        ) : (
                        <>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default function AppSidebar() {
  const router = useRouter();
  const { isSidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  return (
    <aside className={cn(
        "relative hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-60" : "w-20"
      )}>
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className={cn("flex items-center gap-2 font-semibold", !isSidebarOpen && "w-full justify-center")}>
              <AppLogo className="h-6 w-6 text-primary" />
              <span className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 w-0")}>Admissions Edge</span>
            </Link>
             <Button
                variant="ghost"
                size="icon"
                className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 w-0")}
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <AppSidebarContent />
        </div>
    </aside>
  );
}
