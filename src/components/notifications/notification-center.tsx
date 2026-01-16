
'use client';
import { useState, useEffect } from 'react';
import { getNotificationHistory } from '@/lib/data';
import type { AppNotification } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { BellRing } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const history = await getNotificationHistory();
            setNotifications(history);
        } catch (error) {
            console.error("Failed to fetch notification history:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchNotifications();

        const handleNewNotification = () => fetchNotifications();
        window.addEventListener('new-notification', handleNewNotification);

        return () => {
            window.removeEventListener('new-notification', handleNewNotification);
        }
    }, []);

    const handleNotificationClick = (notification: AppNotification) => {
        // Mark as read logic would go here, e.g., an API call
        console.log(`Notification ${notification.id} clicked.`);
        if (notification.data?.url) {
            router.push(notification.data.url);
        }
    };

    if (loading) {
        return (
            <div className="space-y-2 p-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )
    }
    
    return (
        <Command>
            <div className="flex items-center justify-between border-b p-3">
                <h3 className="font-semibold">Notifications</h3>
                {/* You can add a "Mark all as read" button here */}
            </div>
            <CommandList>
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <BellRing className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="font-medium">No new notifications</p>
                        <p className="text-sm text-muted-foreground">Check back later for updates.</p>
                    </div>
                ) : (
                    <CommandGroup>
                        {notifications.map(n => (
                            <CommandItem 
                                key={n.id} 
                                onSelect={() => handleNotificationClick(n)}
                                className={cn("flex flex-col items-start gap-1 rounded-sm px-3 py-2 cursor-pointer")}
                            >
                                <div className='flex justify-between w-full items-center'>
                                    <p className={cn('font-semibold', !n.read && "text-foreground")}>{n.title}</p>
                                    {!n.read && <span className='h-2 w-2 rounded-full bg-primary' />}
                                </div>
                                <p className={cn('text-sm', !n.read ? 'text-muted-foreground' : 'text-muted-foreground/70')}>{n.body}</p>
                                <p className='text-xs text-muted-foreground/70 self-start'>{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    )
}
