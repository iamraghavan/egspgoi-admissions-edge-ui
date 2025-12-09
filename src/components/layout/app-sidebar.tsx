'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { Separator } from '../ui/separator';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/auth';
import { Skeleton } from '../ui/skeleton';

interface UserProfile {
  name: string;
}

export default function AppSidebar() {
  const { placeholderImages } = placeholderImagesData;
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar-1');
  // In a real app, you'd get this from package.json
  const appVersion = "0.1.0"; 
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch user profile for sidebar", error);
      }
    }
    fetchProfile();
  }, []);

  return (
    <aside className="hidden border-r bg-[#161d26] md:block text-white">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AppLogo className="h-6 w-6" />
              <span>Admissions Edge</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Nav isMobile={false} />
          </div>
          <div className="mt-auto p-4 space-y-4">
            <Separator className="bg-gray-700" />
            <div className='flex items-center gap-3'>
              <Avatar className="h-10 w-10">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                <AvatarFallback>
                  {user ? user.name.charAt(0).toUpperCase() : <Skeleton className="h-10 w-10 rounded-full" />}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                {user ? (
                  <span className='text-sm font-medium leading-none'>{user.name}</span>
                ) : (
                  <Skeleton className="h-4 w-24 mb-1" />
                )}
                <span className='text-xs text-gray-400'>v{appVersion}</span>
              </div>
            </div>
          </div>
        </div>
    </aside>
  );
}