
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getNotificationHistory, markNotificationAsRead } from '@/lib/data';
import type { AppNotification } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { BellRing, ArrowRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../ui/button';
import Link from 'next/link';

export function NotificationCenter({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const history = await getNotificationHistory();
            setNotifications(history);
        } catch (error) {
            console.error("Failed to fetch notification history:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);
    

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.read) {
            await markNotificationAsRead(notification.id);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        }
        if (onOpenChange) onOpenChange(false);
        if (notification.data?.url) {
            const dynamicUrl = notification.data.url
                .replace(':role', params.role)
                .replace(':encryptedUserId', params.encryptedUserId);
            router.push(dynamicUrl);
        }
    };

    const notificationsUrl = `/u/app/${params.role}/${params.encryptedUserId}/notifications`;

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
                        {notifications.slice(0, 4).map(n => (
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
            <CommandSeparator />
             <div className="p-1">
                 <Button variant="ghost" className="w-full justify-center text-sm" asChild>
                    <Link href={notificationsUrl} onClick={() => onOpenChange?.(false)}>
                        View all notifications
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </Command>
    )
}
