/**
 * Centralized Notifications Hook
 * 
 * Purpose: Single subscription for notifications instead of duplicate subscriptions
 * in Desktop (NotificationsButton) and Mobile (MobileNotifications) components.
 * 
 * Optimization: Reduces Realtime calls by 50% for notifications.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface UseNotificationsReturn {
    notifications: Notification[];
    hasUnread: boolean;
    markAllAsRead: () => Promise<void>;
    isLoading: boolean;
}

// Singleton to track if subscription is already active
let globalChannel: ReturnType<typeof supabase.channel> | null = null;
let subscriberCount = 0;

export function useNotifications(userId: string | undefined): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Track if this instance has subscribed
    const hasSubscribed = useRef(false);

    // Fetch notifications and read status
    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            // Parallel fetch for better performance
            const [notesResponse, readsResponse] = await Promise.all([
                supabase
                    .from('notifications')
                    .select('*')
                    .or(`target_audience.eq.all,target_audience.eq.users`)
                    .order('created_at', { ascending: false })
                    .limit(20),
                supabase
                    .from('notification_reads')
                    .select('notification_id')
                    .eq('user_id', userId)
            ]);

            const notes = (notesResponse.data || []) as unknown as Notification[];
            const readIds = new Set(
                (readsResponse.data || []).map((r: { notification_id: string }) => r.notification_id)
            );

            setNotifications(notes);
            setHasUnread(notes.some(n => !readIds.has(n.id)));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!userId || notifications.length === 0) return;

        // Optimistic update
        setHasUnread(false);

        // Batch upsert
        const readsToInsert = notifications.map(n => ({
            notification_id: n.id,
            user_id: userId
        }));

        await supabase
            .from('notification_reads')
            .upsert(readsToInsert, {
                onConflict: 'notification_id,user_id',
                ignoreDuplicates: true
            });
    }, [userId, notifications]);

    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        // Initial fetch
        fetchNotifications();

        // Only create subscription if not already exists
        if (!globalChannel) {
            globalChannel = supabase
                .channel('notifications-shared')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',  // Only INSERT - we don't care about UPDATE/DELETE
                        schema: 'public',
                        table: 'notifications'
                    },
                    (payload) => {
                        const newNote = payload.new as Notification;
                        if (newNote.target_audience === 'all' || newNote.target_audience === 'users') {
                            setNotifications(prev => [newNote, ...prev]);
                            setHasUnread(true);
                        }
                    }
                )
                .subscribe();
        }

        subscriberCount++;
        hasSubscribed.current = true;

        return () => {
            if (hasSubscribed.current) {
                subscriberCount--;
                hasSubscribed.current = false;

                // Only remove channel when all subscribers are gone
                if (subscriberCount === 0 && globalChannel) {
                    supabase.removeChannel(globalChannel);
                    globalChannel = null;
                }
            }
        };
    }, [userId, fetchNotifications]);

    return {
        notifications,
        hasUnread,
        markAllAsRead,
        isLoading
    };
}
