
"use client"

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
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface UserProfile {
  name: string;
  email: string;
}

interface UserNavProps {
    isCollapsed?: boolean;
}

export function UserNav({ isCollapsed = false }: UserNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

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
        console.error("Failed to fetch user profile", error);
        handleLogout();
      }
    }
    fetchProfile();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("relative h-10 rounded-full w-full justify-center p-0", !isCollapsed && "justify-start gap-2 px-2")}>
          <Avatar className="h-8 w-8">
            {user ? (
                <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            ) : (
                <Skeleton className="h-8 w-8 rounded-full" />
            )}
          </Avatar>
           {!isCollapsed && user && (
                <div className="flex flex-col space-y-1 items-start truncate">
                    <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
            )}
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
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
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
