
'use client';

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
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { NavItem, Role } from '@/lib/types';
import { usePathname, useParams } from 'next/navigation';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/dashboard`,
    icon: LayoutDashboard,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Leads',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/leads`,
    icon: Users,
    roles: ['Super Admin', 'Admission Manager', 'Admission Executive'],
  },
  {
    title: 'Campaigns',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/campaigns`,
    icon: Megaphone,
    roles: ['Super Admin', 'Marketing Manager'],
  },
  {
    title: 'Budget Approvals',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/budget-approvals`,
    icon: CircleDollarSign,
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Accounting',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/accounting`,
    icon: Landmark,
    roles: ['Super Admin', 'Finance', 'Marketing Manager'],
  },
  {
    title: 'Call Monitoring',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/call-monitoring`,
    icon: Phone,
    roles: ['Super Admin', 'Admission Manager'],
  },
  {
    title: 'Call History',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/call-history`,
    icon: History,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Settings',
    href: (encryptedUserId, role) => `/u/crm/egspgoi/portal/${encryptedUserId}/${role}/settings`,
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
  const { encryptedUserId, role: roleSlug } = params as { encryptedUserId: string; role: string };
  
  const userRole = roleSlugMap[roleSlug] || 'Super Admin';

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href(encryptedUserId, roleSlug)}
            tooltip={item.title}
          >
            <a href={item.href(encryptedUserId, roleSlug)}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
