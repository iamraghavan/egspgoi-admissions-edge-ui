'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useEffect, useState } from 'react';
import { getProfile, logout } from '@/lib/auth';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

export default function AppSidebar() {
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
    <aside className="hidden border-r border-gray-700 bg-[#232f3e] md:block text-white">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-16 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AppLogo className="h-6 w-6 text-primary" />
              <span className='text-white'>Admissions Edge</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Nav isMobile={false} />
          </div>
          <div className="mt-auto p-4 space-y-4">
            <Separator className="bg-gray-700" />
            <div className='flex items-center gap-3'>
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user ? user.name.charAt(0).toUpperCase() : <Skeleton className="h-10 w-10 rounded-full" />}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                {user ? (
                  <>
                    <span className='text-sm font-medium leading-none text-white'>{user.name}</span>
                    <span className='text-xs text-gray-400'>v{appVersion}</span>
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
        </div>
    </aside>
  );
}
