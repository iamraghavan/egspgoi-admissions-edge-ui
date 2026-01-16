
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { getNotificationHistory } from '@/lib/data';
import type { AppNotification } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BellRing, Check, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const history = await getNotificationHistory();
                setNotifications(history);
            } catch (error) {
                console.error("Failed to fetch notification history:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load notifications'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [toast]);

    const handleNotificationClick = (notification: AppNotification) => {
        // Mark as read logic would go here
        if (notification.data?.url) {
            router.push(notification.data.url);
        }
    };
    
    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
        toast({ title: "All notifications marked as read."});
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Notifications"
                description="View all your recent updates and alerts."
            >
                <Button onClick={handleMarkAllAsRead} disabled={notifications.every(n => n.read)}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            </PageHeader>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map(notification => (
                        <Card 
                            key={notification.id} 
                            className={cn("cursor-pointer hover:bg-muted/50 transition-colors", !notification.read && "bg-muted/20 border-primary/50")}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", !notification.read ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="grid gap-1">
                                    <CardTitle>{notification.title}</CardTitle>
                                    <CardDescription>{notification.body}</CardDescription>
                                </div>
                                <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-96">
                    <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">All Caught Up!</h3>
                    <p className="text-muted-foreground mt-2">You don't have any unread notifications.</p>
                </div>
            )}
        </div>
    );
}
