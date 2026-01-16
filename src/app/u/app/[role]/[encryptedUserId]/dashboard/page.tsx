
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/page-header';
import { getProfile } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { Role } from '@/lib/types';

const AdminDashboard = dynamic(() => import('@/components/dashboard/admin-dashboard.tsx'), {
  loading: () => <AdminDashboardSkeleton />,
});

const AdmissionDashboard = dynamic(() => import('@/components/dashboard/admission-dashboard.tsx'), {
  loading: () => <AdminDashboardSkeleton />,
});


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
    // Redirect if role is Admission Executive
    if (roleSlug === 'ae') {
        router.replace(`/u/app/${roleSlug}/${encryptedUserId}/leads`);
        return; // Stop further execution
    }

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
  const isAdmissionRole = userRole === 'Admission Manager' || userRole === 'Admission Executive';

  // Render loading state while redirecting or fetching data
  if (isLoading || roleSlug === 'ae') {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-64" />
            <AdminDashboardSkeleton />
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
