'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CircleDollarSign,
  Phone,
  History,
  Settings,
  Calculator,
  UserCog,
  Bell,
  BookText,
} from 'lucide-react';
import type { NavItem, Role } from '@/lib/types';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useContext, useState, useEffect } from 'react';
import { SidebarContext } from '../ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';


const navItems: NavItem[] = [
  {
    title: 'CORE',
    type: 'heading',
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Dashboard',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/dashboard`,
    icon: LayoutDashboard,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Leads',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/leads`,
    icon: Users,
    roles: ['Super Admin', 'Admission Manager', 'Admission Executive'],
  },
  {
    title: 'Campaigns',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/campaigns`,
    icon: Megaphone,
    roles: ['Super Admin', 'Marketing Manager'],
  },
  {
    title: 'OPERATIONS',
    type: 'heading',
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Call Monitoring',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/call-monitoring`,
    icon: Phone,
    roles: ['Super Admin', 'Admission Manager'],
  },
  {
    title: 'Call History',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/call-history`,
    icon: History,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'FINANCE',
    type: 'heading',
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Budget Approvals',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/budget-approvals`,
    icon: CircleDollarSign,
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Accounting',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/accounting`,
    icon: Calculator,
    roles: ['Super Admin', 'Finance', 'Marketing Manager'],
  },
  {
    title: 'ADMIN',
    type: 'heading',
    roles: ['Super Admin'],
  },
  {
    title: 'CMS',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/cms/sites`,
    icon: BookText,
    roles: ['Super Admin'],
    subItems: [
        { title: 'Sites', href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/cms/sites` },
        { title: 'Pages', href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/cms/pages` },
        { title: 'Posts', href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/cms/posts` },
        { title: 'Categories', href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/cms/categories` },
        { title: 'Ads', href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/cms/ads` },
    ]
  },
  {
    title: 'User Management',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/user-management`,
    icon: UserCog,
    roles: ['Super Admin'],
  },
  {
    title: 'PERSONAL',
    type: 'heading',
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
   {
    title: 'Notifications',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/notifications`,
    icon: Bell,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Preferences',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/settings`,
    icon: Settings,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
];

const roleSlugMap: Record<string, Role> = {
    'sa': 'Super Admin',
    'mm': 'Marketing Manager',
    'am': 'Admission Manager',
    'fin': 'Finance',
    'ae': 'Admission Executive',
};

export default function Nav() {
  const pathname = usePathname();
  const params = useParams();
  const { role: roleSlug, encryptedUserId } = params as { role: string; encryptedUserId: string };
  const { isManuallyToggled, isHovering } = useContext(SidebarContext);
  const isExpanded = isManuallyToggled || isHovering;

  const userRole = roleSlugMap[roleSlug] || 'Super Admin';

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));
  
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

  useEffect(() => {
    const activeCollapsible = visibleNavItems.find(item => 
      item.subItems?.some(sub => pathname.startsWith(sub.href(roleSlug, encryptedUserId)))
    );
    if (activeCollapsible && !openCollapsibles.includes(activeCollapsible.title)) {
      setOpenCollapsibles(prev => [...prev, activeCollapsible.title]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, roleSlug, encryptedUserId]);
  
  const toggleCollapsible = (title: string) => {
    setOpenCollapsibles(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  }

  const renderHeading = (item: NavItem) => {
    if (!isExpanded) {
        return <Separator className="my-3 bg-white/20" />;
    }
    return (
        <div key={item.title} className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-white">
            {item.title}
        </div>
    )
  }

  const renderLink = (item: NavItem) => {
    if (!item.href || !item.icon) return null;
    const href = item.href(roleSlug, encryptedUserId);
    const isActive = pathname.startsWith(href) && (href.split('/').length === pathname.split('/').length || (item.title === "Dashboard" && pathname.endsWith('/dashboard')));

    const commonClasses = cn(
      "flex items-center gap-x-3 rounded-md px-3 py-2.5 text-white transition-all relative",
      isActive
        ? "bg-black/20 font-semibold"
        : "hover:bg-black/10"
    );

    if (!isExpanded) {
        return (
             <TooltipProvider key={item.title} delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link href={href} className={cn("h-11 w-11 p-0 flex items-center justify-center mx-auto rounded-md", commonClasses)}>
                            {isActive && <div className="absolute left-0 h-full w-1 rounded-r-full bg-white"></div>}
                            <item.icon className="h-5 w-5" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{item.title}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
      <Link key={item.title} href={href} className={cn(commonClasses, "h-11")}>
        {isActive && <div className="absolute left-0 h-full w-1 rounded-r-full bg-white"></div>}
        <item.icon className="h-5 w-5 shrink-0 ml-1" />
        <span className="truncate">{item.title}</span>
      </Link>
    );
  }

  const renderCollapsible = (item: NavItem) => {
      if (!item.icon) return null;
      const isOpen = openCollapsibles.includes(item.title);
      const isAnySubItemActive = item.subItems?.some(sub => pathname.startsWith(sub.href(roleSlug, encryptedUserId)));

      const TriggerContent = () => (
         <div className={cn(
                "flex items-center justify-between w-full gap-x-3 rounded-md px-3 py-2.5 text-white transition-all relative hover:bg-black/10"
            )}>
            <div className="flex items-center gap-x-3">
                 {isAnySubItemActive && <div className="absolute left-0 h-full w-1 rounded-r-full bg-white"></div>}
                <item.icon className="h-5 w-5 shrink-0 ml-1" />
                <span className={cn("truncate", !isExpanded && "sr-only")}>{item.title}</span>
            </div>
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90", !isExpanded && "hidden")} />
        </div>
      );

      if (isExpanded) {
        return (
            <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleCollapsible(item.title)}>
                <CollapsibleTrigger asChild>
                    <button className="w-full h-11">
                        <TriggerContent />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 py-1 pl-7">
                {item.subItems?.map(subItem => {
                    if (!subItem.href) return null;
                    const href = subItem.href(roleSlug, encryptedUserId);
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link key={subItem.title} href={href} className={cn(
                                "flex items-center gap-3 rounded-md py-2 px-3 transition-all text-white hover:bg-black/10",
                                isActive ? "font-semibold bg-black/10" : ""
                            )}>
                                <span className="truncate">{subItem.title}</span>
                        </Link>
                    )
                })}
                </CollapsibleContent>
            </Collapsible>
        )
      }

      return (
        <TooltipProvider key={item.title} delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("flex h-11 w-11 p-0 items-center justify-center rounded-md transition-all cursor-pointer mx-auto relative",
                        isAnySubItemActive ? "bg-black/5 text-white" : "text-white hover:bg-black/10"
                    )}>
                        {isAnySubItemActive && <div className="absolute left-0 h-6 w-1 rounded-r-full bg-white"></div>}
                         <item.icon className="h-5 w-5" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{item.title}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )
  }

  const renderNavItem = (item: NavItem) => {
    if(item.type === 'heading') {
        return renderHeading(item);
    }
    if (item.subItems) {
        return renderCollapsible(item);
    }
    return renderLink(item);
  }

  return (
    <nav className={cn("grid gap-1 text-sm font-medium p-2 py-4")}>
      {visibleNavItems.map((item, index) => <div key={item.title + index}>{renderNavItem(item)}</div>)}
    </nav>
  );
}
