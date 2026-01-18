

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
  Landmark,
  UserCog,
  Bell,
  BookText,
  Newspaper,
  PanelTop,
  FileOutput,
  BadgePercent,
  ChevronRight,
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


const navItems: NavItem[] = [
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
    title: 'Budget Approvals',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/budget-approvals`,
    icon: CircleDollarSign,
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Accounting',
    href: (role, encryptedUserId) => `/u/app/${role}/${encryptedUserId}/accounting`,
    icon: Landmark,
    roles: ['Super Admin', 'Finance', 'Marketing Manager'],
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

export default function Nav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const params = useParams();
  const { role: roleSlug, encryptedUserId } = params as { role: string; encryptedUserId: string };
  const { isManuallyToggled, isHovering } = useContext(SidebarContext);
  const isExpanded = isManuallyToggled || isHovering || isMobile;

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


  const renderLink = (item: NavItem) => {
    const href = item.href(roleSlug, encryptedUserId);
    const isActive = pathname === href || (item.title === 'Leads' && pathname.includes('/leads'));

    const commonClasses = cn(
        "flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
    );
    
    const content = (
        <>
            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
            <span className={cn("truncate", isExpanded ? "opacity-100" : "opacity-0 w-0")}>{item.title}</span>
        </>
    );

    if (!isExpanded && !isMobile) {
        return (
             <TooltipProvider key={item.title}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link href={href} className={cn(commonClasses, "h-9 w-9 justify-center p-0")}>
                            {content}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{item.title}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return <Link key={item.title} href={href} className={cn(commonClasses, "px-3")}>{content}</Link>
  }

  const renderCollapsible = (item: NavItem) => {
      const isOpen = openCollapsibles.includes(item.title);
      const isAnySubItemActive = item.subItems?.some(sub => pathname.startsWith(sub.href(roleSlug, encryptedUserId)));

      const TriggerContent = () => (
         <div className={cn(
                "flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                (isAnySubItemActive || isOpen) && "text-primary"
            )}>
            <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span className={cn("truncate", isExpanded ? "opacity-100" : "opacity-0 w-0")}>{item.title}</span>
            </div>
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90", !isExpanded && "hidden")} />
        </div>
      );

      if (isExpanded) {
        return (
            <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleCollapsible(item.title)}>
                <CollapsibleTrigger asChild>
                    <button className="w-full">
                        <TriggerContent />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 py-1 pl-7">
                {item.subItems?.map(subItem => {
                    const href = subItem.href(roleSlug, encryptedUserId);
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link key={subItem.title} href={href} className={cn(
                                "flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary",
                                isActive ? "text-primary" : "",
                                "pl-4 pr-3" // Adjusted padding
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
        <TooltipProvider key={item.title}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={item.href(roleSlug, encryptedUserId)} className={cn("h-9 w-9 justify-center p-0 flex items-center rounded-lg text-muted-foreground transition-all hover:text-primary", isAnySubItemActive && "bg-muted text-primary")}>
                         <item.icon className="h-4 w-4" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{item.title}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )
  }

  const renderNavItem = (item: NavItem) => {
    if (item.subItems) {
        return renderCollapsible(item);
    }
    return renderLink(item);
  }

  return (
    <nav className={cn("grid items-start gap-1 text-sm font-medium", isMobile ? "p-4" : "p-2 py-4")}>
      {visibleNavItems.map(item => renderNavItem(item))}
    </nav>
  );
}
