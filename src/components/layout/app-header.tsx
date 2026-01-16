

'use client';

import { UserNav } from './user-nav';
import { Button } from '../ui/button';
import { Search, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { useState, useEffect, useCallback } from 'react';
import { globalSearch } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { useRouter, useParams } from 'next/navigation';
import { logout } from '@/lib/auth';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppSidebarContent } from './app-sidebar';
import { UserIcon, Megaphone, FileText } from 'lucide-react';
import { debounce } from '@/lib/utils';

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
  
  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
     toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
    });
  }, [router, toast]);

  const handleSearch = async (query: string) => {
    if (query.trim().length > 2) {
      setIsLoading(true);
      try {
        const results = await globalSearch(query);
        setSearchResults(results);
        setIsSearchOpen(true);
      } catch (error: any) {
        console.error("Search failed:", error);
        if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
            handleLogout();
        } else {
             toast({
                variant: "destructive",
                title: "Search Failed",
                description: error.message || "An unexpected error occurred during search.",
            });
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 300), [handleLogout]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSelect = (url: string) => {
    const {encryptedPortalId, role, encryptedUserId} = params as {encryptedPortalId: string, role: string, encryptedUserId: string};
    
    const dynamicUrl = url
        .replace(':encryptedPortalId', encryptedPortalId)
        .replace(':role', role)
        .replace(':encryptedUserId', encryptedUserId);
    
    router.push(dynamicUrl);
    setIsSearchOpen(false);
    setSearchQuery('');
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
                <AppSidebarContent isMobile={true} />
            </SheetContent>
        </Sheet>


      <div className="w-full flex-1">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <form className="w-full">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search leads, campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
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

        <div className="flex items-center gap-2">
          <Separator orientation='vertical' className='h-8 mx-2' />
          <UserNav />
        </div>
    </header>
  );
}
