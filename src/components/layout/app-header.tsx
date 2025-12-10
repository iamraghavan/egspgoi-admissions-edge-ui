
import { UserNav } from './user-nav';
import { Button } from '../ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Nav from './nav';
import Link from 'next/link';
import { AppLogo } from '../icons';

export default function AppHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-700 bg-[#232F3E] px-4 lg:h-[60px] lg:px-6 text-white">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-transparent text-white hover:bg-gray-700/50 hover:text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 bg-[#161d26] text-white border-r-0">
             <div className="flex h-16 items-center border-b border-gray-700 px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <AppLogo className="h-6 w-6" />
                  <span>Admissions Edge</span>
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
              className="w-full appearance-none bg-[#37475a] border-gray-600 text-white placeholder-gray-400 pl-8 shadow-none md:w-2/3 lg:w-1/3 focus:ring-accent"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-gray-700/50">
          <Bell className="h-5 w-5" />
           <span className="sr-only">Toggle notifications</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
