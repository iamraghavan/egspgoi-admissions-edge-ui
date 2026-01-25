

'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { getProfile, logout } from "@/lib/auth"
import { Skeleton } from "../ui/skeleton"
import { useRouter, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { ChevronDown } from "lucide-react"

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface UserNavProps {
    isCollapsed?: boolean;
}

export function UserNav({ isCollapsed = false }: UserNavProps) {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);

  const { role, encryptedUserId } = params as { role: string; encryptedUserId: string };
  const settingsUrl = `/u/app/${role}/${encryptedUserId}/settings`;

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getProfile();
        if (profile) {
            setUser(profile as UserProfile);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    }
    fetchProfile();
  }, []);
  
  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 mx-auto">
              <Avatar className="h-9 w-9">
                {user ? (
                    <AvatarFallback className="bg-white/20">
                    {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                ) : (
                    <Skeleton className="h-9 w-9 rounded-full" />
                )}
              </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            {user ? (
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                </p>
                </div>
            </DropdownMenuLabel>
            ) : (
            <div className="p-2 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
            </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href={settingsUrl}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={settingsUrl}>Settings</Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-1.5 rounded-md hover:bg-black/10">
            <Avatar className="h-8 w-8">
                {user ? (
                    <AvatarFallback className="bg-white/20 text-sm">
                    {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                ) : (
                    <Skeleton className="h-8 w-8 rounded-full" />
                )}
            </Avatar>
            {user ? (
                <span className={cn("text-sm font-medium text-white truncate", isCollapsed && "hidden")}>{user.name}</span>
            ) : (
                 <div className={cn("space-y-1", isCollapsed && "hidden")}>
                    <Skeleton className="h-4 w-24" />
                </div>
            )}
            <ChevronDown className={cn("h-4 w-4 text-white/70 shrink-0", isCollapsed && "hidden")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
         {user ? (
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        ) : (
          <div className="p-2 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={settingsUrl}>Profile</Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href={settingsUrl}>Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
