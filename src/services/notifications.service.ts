import { messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const saveDeviceToken = async (token: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        // Using 'user_devices' table - ensure types are generated if this shows an error
        const { error } = await supabase.from('user_devices').upsert({
            user_id: user.id,
            fcm_token: token,
            device_type: 'web',
            last_active_at: new Date().toISOString()
        }, { onConflict: 'user_id, fcm_token' });

        if (error) throw error;
        // Device token saved to Supabase
    } catch (error) {
        console.error('Error saving token to Supabase:', error);
    }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
    if (!messaging) {
        console.warn('Firebase messaging not initialized');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Notification permission granted
            // Get FCM Token
            const currentToken = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            }).catch(async (err) => {
                console.warn('Failed with VAPID, trying without...', err);
                return await getToken(messaging);
            });

            if (currentToken) {
                // FCM Token acquired
                await saveDeviceToken(currentToken);
                return currentToken;
            } else {
                console.warn('No registration token available. Request permission to generate one.');
                return null;
            }
        } else {
            console.warn('Notification permission denied');
            toast.error('Notifications permission denied');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            // Payload received
            resolve(payload);
        });
    });
