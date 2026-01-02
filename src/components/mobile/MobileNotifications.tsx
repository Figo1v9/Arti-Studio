/**
 * Mobile Notifications Component
 * 
 * Optimized: Uses shared useNotifications hook to avoid duplicate Realtime subscriptions
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

export function MobileNotifications({ userId }: { userId?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    // Use shared hook instead of local subscription
    const { notifications, hasUnread, markAllAsRead } = useNotifications(userId);

    const handleOpen = () => {
        if (!isOpen) {
            setIsOpen(true);
            if (hasUnread) {
                markAllAsRead();
            }
        } else {
            setIsOpen(false);
        }
    };

    if (!userId) {
        return (
            <button
                onClick={() => toast.error('Please sign in to view notifications')}
                className="relative p-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors bg-transparent min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
        );
    }

    return (
        <>
            <button
                onClick={handleOpen}
                className={cn(
                    "relative p-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors bg-transparent min-w-[44px] min-h-[44px] flex items-center justify-center",
                    isOpen && "bg-white/10 text-white"
                )}
                aria-label="Notifications"
            >
                <Bell className={cn("w-5 h-5 transition-colors", isOpen ? "text-white" : "text-muted-foreground")} />
                {hasUnread && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-black" />
                )}
            </button>

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                            />

                            {/* Drawer / Dropdown */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="fixed top-[60px] left-4 right-4 max-h-[70vh] bg-[#121217] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col"
                            >
                                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-violet-400" />
                                        <span className="font-semibold text-white">Notifications</span>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto p-2 scrollbar-thin flex-1 min-h-0 bg-[#0A0A0F]">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                                <Bell className="w-6 h-6 opacity-30" />
                                            </div>
                                            <p>No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(note => (
                                            <div key={note.id} className="p-4 mb-2 bg-[#18181B] border border-white/5 rounded-xl active:bg-[#202025] transition-colors relative group">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full mt-2 shrink-0",
                                                        note.type === 'info' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                            note.type === 'success' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                                note.type === 'warning' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-white leading-tight mb-1.5">{note.title}</h4>
                                                        <p className="text-xs text-gray-400 leading-relaxed opacity-90">{note.message}</p>

                                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                                            <span className="text-[10px] text-gray-600 font-medium font-mono">
                                                                {formatDate(note.created_at)}
                                                            </span>
                                                            {note.link && (
                                                                <a href={note.link} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full font-medium hover:bg-violet-500/20 transition-colors">
                                                                    View Details
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
