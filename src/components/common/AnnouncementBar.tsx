import React, { useEffect, useState } from 'react';
import { MarketingService } from '@/services/marketing.service';
import { Announcement } from '@/types/database.types';
import { X, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        const data = await MarketingService.getActiveAnnouncement();
        setAnnouncement(data);
    };

    if (!announcement || !visible) return null;

    return (
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
            <div className="container mx-auto px-4 py-2.5 flex items-center justify-center text-sm md:text-base font-medium relative z-10">
                <div className="flex items-center gap-2 text-center">
                    <Megaphone className="w-4 h-4 fill-white/20 hidden sm:block" />
                    <span>{announcement.message || announcement.title}</span>
                    {announcement.link && (
                        <a
                            href={announcement.link}
                            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-white/80 transition-colors ml-2 font-bold"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Checkout <ArrowRight className="w-3 h-3" />
                        </a>
                    )}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close announcement"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </div>
    );
}
