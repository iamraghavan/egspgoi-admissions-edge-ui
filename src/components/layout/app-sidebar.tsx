'use client';

import Nav from './nav';
import { AppLogo } from '../icons';
import Link from 'next/link';

export default function AppSidebar() {
  return (
    <aside className="hidden border-r bg-[#161d26] md:block text-white">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AppLogo className="h-6 w-6" />
              <span>Admissions Edge</span>
            </Link>
          </div>
          <div className="flex-1">
            <Nav isMobile={false} />
          </div>
        </div>
    </aside>
  );
}
