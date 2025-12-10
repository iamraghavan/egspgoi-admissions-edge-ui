import { UserNav } from './user-nav';
import { Button } from '../ui/button';
import { Bell, Search, Menu, Settings } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Nav from './nav';
import Link from 'next/link';
import { AppLogo } from '../icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from '../ui/separator';

export default function AppHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-700 bg-[#232F3E] px-4 lg:h-[60px] lg:px-6 text-white">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-transparent text-white hover:bg-gray-700/50 hover:text-white border-gray-600"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 bg-[#232f3e] text-white border-r-0">
             <div className="flex h-16 items-center border-b border-gray-700 px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <AppLogo className="h-6 w-6 text-primary" />
                  <span className='text-white'>Admissions Edge</span>
                </Link>
              </div>
            <Nav isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-[#161d26] border-gray-700 text-white placeholder-gray-400 pl-8 shadow-none md:w-2/3 lg:w-1/3 focus:ring-primary"
            />
          </div>
        </form>
      </div>
      <TooltipProvider>
        <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-gray-700/50">
                  <Bell className="h-6 w-6" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-gray-700/50">
                  <Settings className="h-6 w-6" />
                   <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          <Separator orientation='vertical' className='h-8 bg-gray-600' />
          <UserNav />
        </div>
      </TooltipProvider>
    </header>
  );
}
