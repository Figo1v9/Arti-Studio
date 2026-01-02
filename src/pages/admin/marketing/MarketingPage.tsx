import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Edit2, Check, X, Link as LinkIcon, Calendar } from 'lucide-react';
import { MarketingService } from '@/services/marketing.service';
import { Announcement } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function MarketingPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await MarketingService.getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem?.title) return;

        try {
            await MarketingService.upsertAnnouncement(editingItem);
            toast.success('Announcement saved');
            setIsDialogOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await MarketingService.deleteAnnouncement(id);
            toast.success('Deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleToggleActive = async (announcement: Announcement) => {
        try {
            await MarketingService.toggleActive(announcement.id, !announcement.is_active);
            toast.success(announcement.is_active ? 'Deactivated' : 'Activated (others deactivated)');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-pink-500" />
                        Marketing & Announcements
                    </h1>
                    <p className="text-gray-400 mt-1">Manage site-wide banners and notifications.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setEditingItem({})}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>{editingItem?.id ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                            <DialogDescription className="sr-only">
                                Form to create or edit a marketing announcement.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title (Internal Name)</label>
                                <Input
                                    className="bg-black/20 border-white/10"
                                    value={editingItem?.title || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message (Displayed Text)</label>
                                <Textarea
                                    className="bg-black/20 border-white/10"
                                    value={editingItem?.message || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link URL (Optional)</label>
                                <Input
                                    className="bg-black/20 border-white/10"
                                    value={editingItem?.link || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            {/* Simple Date fields could be added here if needed */}
                            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
                                Save Announcement
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                        <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg text-gray-300">No Announcements Created</h3>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item.id} className={cn(
                            "group bg-white/5 border rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center transition-all",
                            item.is_active ? "border-pink-500/50 bg-pink-500/5" : "border-white/10"
                        )}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    {item.is_active && (
                                        <span className="bg-pink-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Active</span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{item.message}</p>
                                {item.link && (
                                    <div className="flex items-center gap-1 text-xs text-blue-400">
                                        <LinkIcon className="w-3 h-3" />
                                        {item.link}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center">
                                <Button
                                    variant="outline" size="sm"
                                    className={cn(
                                        "bg-transparent border-white/10",
                                        item.is_active ? "text-amber-400 hover:text-amber-300" : "text-emerald-400 hover:text-emerald-300"
                                    )}
                                    onClick={() => handleToggleActive(item)}
                                >
                                    {item.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="ghost" size="icon"
                                    className="hover:bg-white/10 text-gray-400 hover:text-white"
                                    onClick={() => {
                                        setEditingItem(item);
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost" size="icon"
                                    className="hover:bg-red-500/10 text-gray-400 hover:text-red-500"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
