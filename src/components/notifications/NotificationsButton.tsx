/**
 * Desktop Notifications Button
 * 
 * Optimized: Uses shared useNotifications hook to avoid duplicate Realtime subscriptions
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationsButton({ userId }: { userId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    // Use shared hook instead of local subscription
    const { notifications, hasUnread, markAllAsRead } = useNotifications(userId);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom - 10,
                left: rect.right + 10
            });
        }
    };

    const handleOpen = () => {
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
            if (hasUnread) {
                markAllAsRead();
            }
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (buttonRef.current?.contains(target)) return;
            const popoverEl = document.getElementById('portal-notification-popover');
            if (popoverEl?.contains(target)) return;
            setIsOpen(false);
        };
        window.addEventListener('mousedown', handleClick);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('mousedown', handleClick);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    if (!userId) return null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleOpen}
                className={cn(
                    "p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-all text-muted-foreground hover:text-foreground relative group",
                    isOpen && "bg-secondary/60 text-foreground ring-1 ring-border"
                )}
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0F0F16]" />
                )}
            </button>

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id="portal-notification-popover"
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            className="fixed w-80 md:w-96 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[9999] backdrop-blur-xl"
                            style={{
                                top: coords.top - 400 > 0 ? coords.top - 400 : 20,
                                left: coords.left,
                                bottom: 20
                            }}
                        >
                            <div className="flex flex-col h-full max-h-[80vh]">
                                <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                                    <span className="text-sm font-semibold text-white">Notifications</span>
                                    <div className="flex items-center gap-2">
                                        {/* Push Notification Request Button */}
                                        {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const { requestNotificationPermission } = await import('@/services/notifications.service');
                                                    const token = await requestNotificationPermission();
                                                    if (token) {
                                                        setIsOpen(false);
                                                        setTimeout(() => setIsOpen(true), 100);
                                                    }
                                                }}
                                                className="text-[10px] bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                title="Enable Push Notifications"
                                            >
                                                <Bell className="w-3 h-3" /> Enable
                                            </button>
                                        )}
                                        {notifications.length > 0 && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{notifications.length}</span>}
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-y-auto p-2 scrollbar-thin flex-1 min-h-0">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.map(note => (
                                            <div key={note.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors mb-1 last:mb-0 group/item relative">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                        note.type === 'info' ? "bg-blue-500" :
                                                            note.type === 'success' ? "bg-emerald-500" :
                                                                note.type === 'warning' ? "bg-amber-500" : "bg-violet-500"
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-white leading-tight mb-1">{note.title}</h4>
                                                        <p className="text-xs text-gray-400 leading-relaxed max-w-full break-words">{note.message}</p>

                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] text-gray-600">
                                                                {formatDate(note.created_at)}
                                                            </span>
                                                            {note.link && (
                                                                <a href={note.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-400 hover:text-violet-300 hover:underline">
                                                                    Visit Link
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
