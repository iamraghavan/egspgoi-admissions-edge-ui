
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
    href: (id) => `/u/crm/egspgoi/portal/${id}/dashboard`,
    icon: LayoutDashboard,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Leads',
    href: (id) => `/u/crm/egspgoi/portal/${id}/leads`,
    icon: Users,
    roles: ['Super Admin', 'Admission Manager', 'Admission Executive'],
  },
  {
    title: 'Campaigns',
    href: (id) => `/u/crm/egspgoi/portal/${id}/campaigns`,
    icon: Megaphone,
    roles: ['Super Admin', 'Marketing Manager'],
  },
  {
    title: 'Budget Approvals',
    href: (id) => `/u/crm/egspgoi/portal/${id}/budget-approvals`,
    icon: CircleDollarSign,
    roles: ['Super Admin', 'Marketing Manager', 'Finance'],
  },
  {
    title: 'Accounting',
    href: (id) => `/u/crm/egspgoi/portal/${id}/accounting`,
    icon: Landmark,
    roles: ['Super Admin', 'Finance', 'Marketing Manager'],
  },
  {
    title: 'Call Monitoring',
    href: (id) => `/u/crm/egspgoi/portal/${id}/call-monitoring`,
    icon: Phone,
    roles: ['Super Admin', 'Admission Manager'],
  },
  {
    title: 'Call History',
    href: (id) => `/u/crm/egspgoi/portal/${id}/call-history`,
    icon: History,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
  {
    title: 'Settings',
    href: (id) => `/u/crm/egspgoi/portal/${id}/settings`,
    icon: Settings,
    roles: ['Super Admin', 'Marketing Manager', 'Admission Manager', 'Finance', 'Admission Executive'],
  },
];

export default function Nav() {
  const pathname = usePathname();
  const params = useParams();
  const encryptedUserId = params.encryptedUserId as string;

  // In a real app, this role would come from a session/context
  const userRole: Role = 'Admission Manager'; 

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href(encryptedUserId)}
            tooltip={item.title}
          >
            <a href={item.href(encryptedUserId)}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
