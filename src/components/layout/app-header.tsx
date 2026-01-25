'use client';

import { UserNav } from './user-nav';
import { Button } from '../ui/button';
import { Search, Menu, Bell, Settings, HelpCircle, Plus } from 'lucide-react';
import { Dialpad } from '../icons';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { useState, useEffect, useCallback, useContext } from 'react';
import { globalSearch, getNotificationHistory, markAllNotificationsAsRead } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { SidebarContext } from '../ui/sidebar';
import { UserIcon, Megaphone, FileText } from 'lucide-react';
import { debounce, cn } from '@/lib/utils';
import { NotificationCenter } from '../notifications/notification-center';
import type { AppNotification } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const getIconForType = (type: string) => {
    switch (type) {
      case 'lead':
        return <UserIcon className="mr-3 h-5 w-5 text-muted-foreground" />;
      case 'campaign':
        return <Megaphone className="mr-3 h-5 w-5 text-muted-foreground" />;
      case 'user':
        return <UserIcon className="mr-3 h-5 w-5 text-muted-foreground" />;
      default:
        return <FileText className="mr-3 h-5 w-5 text-muted-foreground" />;
    }
};

export default function AppHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { setManuallyToggled } = useContext(SidebarContext);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');
    
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

    return `${day}/${month}/${year} - ${formattedHours}:${minutes}:${seconds} ${ampm} - ${weekday}`;
  };

  const checkUnread = useCallback(async () => {
    try {
        const notifs = await getNotificationHistory();
        setHasUnread(notifs.some(n => !n.read));
    } catch (e) {
        // fail silently
    }
  }, []);

  useEffect(() => {
    checkUnread();
    
    // Periodically check for new notifications
    const interval = setInterval(checkUnread, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [checkUnread]);

  const handleSearch = async (query: string) => {
    if (query.trim().length > 2) {
      setIsLoading(true);
      try {
        const results = await globalSearch(query);
        setSearchResults(results);
        setIsSearchOpen(true);
      } catch (error: any) {
        console.error("Search failed:", error);
        toast({
            variant: "destructive",
            title: "Search Failed",
            description: error.message || "An unexpected error occurred during search.",
        });
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSelect = (url: string) => {
    const { role, encryptedUserId } = params as { role: string, encryptedUserId: string };
    
    const dynamicUrl = url
        .replace(':role', role)
        .replace(':encryptedUserId', encryptedUserId);
    
    router.push(dynamicUrl);
    setIsSearchOpen(false);
    setSearchQuery('');
  }
  
  const handleNotifOpenChange = async (open: boolean) => {
    setNotifOpen(open);
    if(open && hasUnread) {
        await markAllNotificationsAsRead();
        setHasUnread(false);
    }
  }


  return (
    <header className="flex items-center gap-4 border-b-0 bg-[#57002f] px-6 sm:px-8 py-3 text-white">
        <Button size="icon" variant="ghost" className="sm:hidden text-white hover:bg-white/10" onClick={() => setManuallyToggled(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
        </Button>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <form className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full appearance-none rounded-full border-none bg-black/20 pl-9 text-white shadow-none placeholder:text-white/70 md:w-64"
                />
              </div>
            </form>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandList>
                {isLoading && <CommandEmpty>Searching...</CommandEmpty>}
                {!isLoading && searchResults.length === 0 && searchQuery.length > 2 && <CommandEmpty>No results found.</CommandEmpty>}
                {searchResults.length > 0 && !isLoading && (
                   <CommandGroup heading="Results">
                    {searchResults.map((item, index) => (
                      <React.Fragment key={`${item.id}-${item.type}`}>
                        <CommandItem
                          onSelect={() => handleSelect(item.url)}
                          value={`${item.name}-${item.type}`}
                          className='cursor-pointer'
                        >
                          <div className="flex items-center w-full">
                            {getIconForType(item.type)}
                            <div className="flex flex-col">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {item.type === 'lead' || item.type === 'user' ? item.email : (item.type?.charAt(0).toUpperCase() + item.type?.slice(1))}
                                </span>
                            </div>
                          </div>
                        </CommandItem>
                        {index < searchResults.length - 1 && <CommandSeparator />}
                      </React.Fragment>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-grow hidden lg:flex items-center justify-center">
        <div className="text-sm font-medium text-white/90">
            {formatDateTime(currentDate)}
        </div>
      </div>

        <div className="flex items-center gap-1">
           <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-white/80 hover:bg-black/10 hover:text-white">
                            <Dialpad className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/80 text-white border-none"><p>Dialpad</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            
           <Popover open={isNotifOpen} onOpenChange={handleNotifOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white/80 hover:bg-black/10 hover:text-white">
                    <Bell className="h-5 w-5" />
                    {hasUnread && <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-400" />}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <NotificationCenter onOpenChange={setNotifOpen} />
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />
          
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-white/80 hover:bg-black/10 hover:text-white">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/80 text-white border-none"><p>Settings</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-white/80 hover:bg-black/10 hover:text-white">
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/80 text-white border-none"><p>Help</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          <UserNav />
        </div>
    </header>
  );
}
