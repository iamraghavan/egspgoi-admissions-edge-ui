
'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { PreferencesForm } from '@/components/settings/preferences-form';
import { ProfileForm } from '@/components/settings/profile-form';
import { getProfile } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            const profile = await getProfile();
            if (isMounted) {
                setUser(profile as User);
                setLoading(false);
            }
        };
        fetchProfile();

        return () => {
            isMounted = false;
        };
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
                 <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <ProfileForm user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="preferences">
                        <PreferencesForm user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                </Tabs>
            ) : (
                <p>Could not load user profile.</p>
            )}
        </div>
    );
}
