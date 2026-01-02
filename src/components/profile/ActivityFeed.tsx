import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
    UserPlus,
    Heart,
    Eye,
    Copy,
    Users,
    ImagePlus,
    Trophy,
    Loader2
} from 'lucide-react';
import { ActivityService, ActivityItem, ActivityType } from '@/services/activity.service';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
    userId: string;
    type?: 'own' | 'following';
    limit?: number;
    className?: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
    follow: <UserPlus className="w-4 h-4 text-violet-400" />,
    unfollow: <UserPlus className="w-4 h-4 text-gray-400" />,
    like: <Heart className="w-4 h-4 text-rose-400" />,
    view_milestone: <Eye className="w-4 h-4 text-blue-400" />,
    copy_milestone: <Copy className="w-4 h-4 text-emerald-400" />,
    follower_milestone: <Users className="w-4 h-4 text-amber-400" />,
    upload: <ImagePlus className="w-4 h-4 text-purple-400" />
};

const activityMessages: Record<ActivityType, (item: ActivityItem) => string> = {
    follow: () => 'started following someone',
    unfollow: () => 'unfollowed someone',
    like: () => 'liked an image',
    view_milestone: (item) => `reached ${item.metadata?.milestone || ''} views!`,
    copy_milestone: (item) => `reached ${item.metadata?.milestone || ''} copies!`,
    follower_milestone: (item) => `reached ${item.metadata?.milestone || ''} followers! 🎉`,
    upload: () => 'uploaded a new image'
};

export function ActivityFeed({ userId, type = 'own', limit = 20, className }: ActivityFeedProps) {
    const navigate = useNavigate();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, [userId, type]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = type === 'following'
                ? await ActivityService.getFollowingActivities(userId, limit)
                : await ActivityService.getUserActivities(userId, limit);
            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMilestoneIcon = (item: ActivityItem) => {
        const milestone = item.metadata?.milestone || 0;
        if (milestone >= 1000) {
            return <Trophy className="w-4 h-4 text-amber-400" />;
        }
        return activityIcons[item.type];
    };

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center py-8", className)}>
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className={cn("text-center py-8", className)}>
                <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        {activity.type.includes('milestone')
                            ? getMilestoneIcon(activity)
                            : activityIcons[activity.type]
                        }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                            {activityMessages[activity.type](activity)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                    </div>

                    {/* Target preview if image */}
                    {activity.target_type === 'image' && activity.target_image_url && (
                        <button
                            onClick={() => navigate(`/image/${activity.target_id}`)}
                            className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                        >
                            <img
                                src={activity.target_image_url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
