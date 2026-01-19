
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { getProfile } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { Role } from '@/lib/types';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import AdmissionDashboard from '@/components/dashboard/admission-dashboard';
import ExecutiveDashboard from '@/components/dashboard/executive-dashboard';

const roleSlugMap: Record<string, Role> = {
    'sa': 'Super Admin',
    'mm': 'Marketing Manager',
    'am': 'Admission Manager',
    'fin': 'Finance',
    'ae': 'Admission Executive',
};

const AdminDashboardSkeleton = () => (
    <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    </div>
);


export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { role: roleSlug, encryptedUserId } = params as { role: string, encryptedUserId: string };
  const [userName, setUserName] = useState<string>('User');
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    const fetchProfile = async () => {
        setIsLoading(true);
        const profile = await getProfile();
        if (profile && profile.name) {
          setUserName(profile.name.split(' ')[0]);
        }
        setIsLoading(false);
    }
    fetchProfile();
  }, [roleSlug, router, encryptedUserId]);

  const userRole = roleSlugMap[roleSlug] || 'Super Admin';
  
  const renderDashboardByRole = () => {
      if (isLoading) {
          return <AdminDashboardSkeleton />;
      }
      switch (userRole) {
          case 'Admission Executive':
              return <ExecutiveDashboard />;
          case 'Admission Manager':
              return <AdmissionDashboard />;
          case 'Marketing Manager':
          case 'Finance':
          case 'Super Admin':
              return <AdminDashboard />;
          default:
              return <AdminDashboard />;
      }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={isLoading ? `Welcome Back...` : `Welcome Back, ${userName}!`} description="Here's a snapshot of your admissions activity." />
      
      {renderDashboardByRole()}
    </div>
  );
}
