
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
  Landmark
} from 'lucide-react';
import type { NavItem, Role } from '@/lib/types';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AppLogo } from '../icons';
import { useContext } from 'react';
import { SidebarContext } from '../ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/dashboard`,
    icon: LayoutDashboard,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Leads',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/leads`,
    icon: Users,
    roles: ['Super Admin', 'Admission Manager', 'Admission Executive'],
  },
  {
    title: 'Campaigns',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/campaigns`,
    icon: Megaphone,
    roles: ['Super Admin', 'Marketing Manager'],
  },
  {
    title: 'Budget Approvals',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/budget-approvals`,
    icon: CircleDollarSign,
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Accounting',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/accounting`,
    icon: Landmark,
    roles: ['Super Admin', 'Finance', 'Marketing Manager'],
  },
  {
    title: 'Call Monitoring',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/call-monitoring`,
    icon: Phone,
    roles: ['Super Admin', 'Admission Manager'],
  },
  {
    title: 'Call History',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/call-history`,
    icon: History,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Settings',
    href: (encryptedPortalId, role, encryptedUserId) => `/u/crm/${encryptedPortalId}/${role}/${encryptedUserId}/settings`,
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
  const { encryptedPortalId, role: roleSlug, encryptedUserId } = params as { encryptedPortalId: string; role: string; encryptedUserId: string };
  const { isManuallyToggled, isHovering } = useContext(SidebarContext);
  const isExpanded = isManuallyToggled || isHovering;

  const userRole = roleSlugMap[roleSlug] || 'Super Admin';

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const renderLink = (item: NavItem) => {
    const href = item.href(encryptedPortalId, roleSlug, encryptedUserId);
    const isActive = pathname.startsWith(href);

    if (!isExpanded && !isMobile) {
        return (
             <TooltipProvider key={item.title}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link
                            href={href}
                            className={cn(
                            "flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary",
                            isActive && "text-primary bg-muted",
                            "h-9 w-9"
                            )}
                        >
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
         <Link
            key={item.title}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary",
              isMobile && "text-base"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className={cn("truncate", (isExpanded || isMobile) ? "opacity-100" : "opacity-0 w-0")}>{item.title}</span>
          </Link>
    )
  }

  return (
    <nav className={cn("grid items-start gap-1 text-sm font-medium", isMobile ? "p-4" : "p-2 py-4")}>
      {visibleNavItems.map(renderLink)}
    </nav>
  );
}
