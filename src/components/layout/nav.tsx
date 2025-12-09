
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
    href: (role) => `/${role}/dashboard`,
    icon: LayoutDashboard,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Leads',
    href: (role) => `/${role}/leads`,
    icon: Users,
    roles: ['Super Admin', 'Admission Manager', 'Admission Executive'],
  },
  {
    title: 'Campaigns',
    href: (role) => `/${role}/campaigns`,
    icon: Megaphone,
    roles: ['Super Admin', 'Marketing Manager'],
  },
  {
    title: 'Budget Approvals',
    href: (role) => `/${role}/budget-approvals`,
    icon: CircleDollarSign,
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Accounting',
    href: (role) => `/${role}/accounting`,
    icon: Landmark,
    roles: ['Super Admin', 'Finance', 'Marketing Manager'],
  },
  {
    title: 'Call Monitoring',
    href: (role) => `/${role}/call-monitoring`,
    icon: Phone,
    roles: ['Super Admin', 'Admission Manager'],
  },
  {
    title: 'Call History',
    href: (role) => `/${role}/call-history`,
    icon: History,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Settings',
    href: (role) => `/${role}/settings`,
    icon: Settings,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
];

const roleMap: Record<string, Role> = {
    'super-admin': 'Super Admin',
    'marketing-manager': 'Marketing Manager',
    'admission-manager': 'Admission Manager',
    'finance': 'Finance',
    'admission-executive': 'Admission Executive',
    'admin': 'Super Admin' // Default/fallback role
};

export default function Nav() {
  const pathname = usePathname();
  const params = useParams();
  const roleSlug = params.role as string;
  
  const userRole = roleMap[roleSlug] || 'Super Admin';

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href(roleSlug)}
            tooltip={item.title}
          >
            <a href={item.href(roleSlug)}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
