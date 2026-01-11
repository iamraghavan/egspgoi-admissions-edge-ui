
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { getProfile } from '@/lib/auth';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import AdmissionDashboard from '@/components/dashboard/admission-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Role } from '@/lib/types';

const roleSlugMap: Record<string, Role> = {
    'sa': 'Super Admin',
    'mm': 'Marketing Manager',
    'am': 'Admission Manager',
    'fin': 'Finance',
    'ae': 'Admission Executive',
};


export default function DashboardPage() {
  const params = useParams();
  const { role: roleSlug } = params as { role: string };
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
  }, []);

  const userRole = roleSlugMap[roleSlug] || 'Super Admin';
  const isAdmissionRole = userRole === 'Admission Manager' || userRole === 'Admission Executive';

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome Back, ${userName}!`} description="Here's a snapshot of your admissions activity." />
      
      {isAdmissionRole ? (
        <AdmissionDashboard />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}
