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

export default function Nav() {
  const pathname = usePathname();
  const params = useParams();
  const { encryptedPortalId, role: roleSlug, encryptedUserId } = params as { encryptedPortalId: string; role: string; encryptedUserId: string };
  
  const userRole = roleSlugMap[roleSlug] || 'Super Admin';

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href(encryptedPortalId, roleSlug, encryptedUserId)}
            tooltip={item.title}
          >
            <a href={item.href(encryptedPortalId, roleSlug, encryptedUserId)}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
