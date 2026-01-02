
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Bell,
    Plus,
    Trash2,
    RefreshCw,
    Send,
    Users,
    Info,
    AlertTriangle,
    CheckCircle,
    Megaphone,
    Loader2,
    Calendar,
    Link as LinkIcon,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

const typeIcons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    promo: Megaphone,
};

const typeColors = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    promo: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export default function NotificationsManagement() {
    const [notifications, setNotifications] = useState<(Notification & { read_count: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as const,
        target_audience: 'all' as const,
        link: ''
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // 1. Fetch Notifications
            const { data: notes, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    setNotifications([]);
                    return;
                }
                throw error;
            }

            // 2. Fetch Read Stats (Direct Aggregation)
            const statsMap: Record<string, number> = {};

            try {
                const { data: reads, error: readsError } = await supabase
                    .from('notification_reads')
                    .select('notification_id');

                if (!readsError && reads) {
                    reads.forEach((r: { notification_id: string }) => {
                        statsMap[r.notification_id] = (statsMap[r.notification_id] || 0) + 1;
                    });
                }
            } catch (err) {
                console.warn('Could not fetch analytics:', err);
            }

            // Merge
            const notesWithStats = (notes || []).map(n => ({
                ...n,
                read_count: statsMap[n.id] || 0
            }));

            setNotifications(notesWithStats);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Could not load notifications');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            target_audience: 'all',
            link: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const payload = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                target_audience: formData.target_audience,
                link: formData.link || null
            };

            const { error } = await supabase
                .from('notifications')
                .insert(payload);

            if (error) throw error;

            toast.success('Notification broadcasted');
            setIsModalOpen(false);
            resetForm();
            fetchNotifications();
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send');
        } finally {
            setFormLoading(false);
        }
    };

    const deleteNotification = async (id: string) => {
        if (!confirm('Permanently delete this notification?')) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Notification removed');
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-violet-500" />
                        Notifications Center
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Broadcast updates and track their impact.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchNotifications}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25">
                                <Plus className="w-4 h-4 mr-2" />
                                New Broadcast
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#121217] border-white/10 text-white sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <Send className="w-5 h-5 text-violet-500" />
                                    Send Notification
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Compose a new message to broadcast to your users.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Update Available"
                                        className="bg-white/5 border-white/10 text-white focus:border-violet-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Message</Label>
                                    <Textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Message content..."
                                        className="bg-white/5 border-white/10 text-white min-h-[100px] focus:border-violet-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Link (Optional)</Label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            placeholder="/profile"
                                            className="bg-white/5 border-white/10 text-white pl-9 focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: 'info' | 'warning' | 'success' | 'promo') => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Information</SelectItem>
                                                <SelectItem value="success">Success</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="promo">Promotion</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Audience</Label>
                                        <Select
                                            value={formData.target_audience}
                                            onValueChange={(value: 'all' | 'users' | 'admins') => setFormData({ ...formData, target_audience: value })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Everyone</SelectItem>
                                                <SelectItem value="users">Users Only</SelectItem>
                                                <SelectItem value="admins">Admins Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="hover:bg-white/5 text-gray-400"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={formLoading}
                                        className="bg-violet-600 hover:bg-violet-700"
                                    >
                                        {formLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send className="w-4 h-4 mr-2" /> Broadcast</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Notifications Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground animate-pulse">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        Fetching updates...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                        <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium text-white">No active notifications</h3>
                        <Button variant="outline" className="mt-4 bg-white/5" onClick={() => setIsModalOpen(true)}>
                            Create First Notification
                        </Button>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const Icon = typeIcons[notification.type];
                        return (
                            <div
                                key={notification.id}
                                className="group relative overflow-hidden bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-2xl p-5 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border',
                                        typeColors[notification.type]
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-tight mb-1">
                                                    {notification.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full capitalize">
                                                        <Users className="w-3 h-3" />
                                                        {notification.target_audience}
                                                    </span>

                                                    {/* READ STATS BADGE */}
                                                    <span className="flex items-center gap-1.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-medium" title="Unique users who opened this">
                                                        <Eye className="w-3.5 h-3.5" />
                                                        {notification.read_count} Reads
                                                    </span>

                                                    {notification.link && (
                                                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full text-violet-300">
                                                            <LinkIcon className="w-3 h-3" />
                                                            Link
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
