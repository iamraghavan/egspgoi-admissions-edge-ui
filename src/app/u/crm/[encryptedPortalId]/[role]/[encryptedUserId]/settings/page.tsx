
'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { PreferencesForm } from '@/components/settings/preferences-form';
import { getProfile } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await getProfile();
            setUser(profile as User);
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader 
                title="Settings" 
                description="Manage your account preferences and application settings." 
            />

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : user ? (
                <PreferencesForm user={user} onUpdate={handleUpdate} />
            ) : (
                <p>Could not load user profile.</p>
            )}
        </div>
    );
}
