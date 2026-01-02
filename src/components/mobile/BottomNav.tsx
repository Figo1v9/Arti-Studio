import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Image, Heart, User, Search, Flame, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth';
import { toast } from 'sonner';

interface BottomNavProps {
  onSearchClick: () => void;
}

const NAV_ITEMS = [
  { id: 'explore', path: '/explore', label: 'Explore', icon: Compass },
  { id: 'following', path: '/following', label: 'Following', icon: Users, requiresAuth: true },
  { id: 'search', label: 'Search', icon: Search, isSearch: true },
  { id: 'favorites', path: '/favorites', label: 'Favorites', icon: Heart, requiresAuth: true },
  { id: 'profile', path: '/profile', label: 'Profile', icon: User },
];

export function BottomNav({ onSearchClick }: BottomNavProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('explore');

  // Sync active tab with current route
  useEffect(() => {
    const currentItem = NAV_ITEMS.find(item => item.path === location.pathname);
    if (currentItem) {
      setActiveTab(currentItem.id);
    } else if (profile?.username && location.pathname === `/${profile.username}`) {
      // User is on their own profile page (via /:username route)
      setActiveTab('profile');
    }
  }, [location.pathname, profile?.username]);

  const handleClick = (item: typeof NAV_ITEMS[0]) => {
    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (item.isSearch) {
      onSearchClick();
      return;
    }

    // Handle Profile tab specially - redirect to user's profile URL
    if (item.id === 'profile') {
      if (!user) {
        toast.info('Please sign in first');
        navigate('/login');
        return;
      }
      // Navigate to user's profile using username
      setActiveTab(item.id);
      navigate(profile?.username ? `/${profile.username}` : '/profile');
      return;
    }

    if (item.requiresAuth && !user) {
      toast.info('Please sign in first');
      navigate('/login');
      return;
    }

    if (item.path) {
      setActiveTab(item.id);
      navigate(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />

      {/* Safe area spacer */}
      <div className="relative flex items-end justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id && !item.isSearch;
          const Icon = item.icon;

          // Search button (center, elevated)
          if (item.isSearch) {
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleClick(item)}
                className="relative -mt-6 z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  {item.label}
                </span>
              </motion.button>
            );
          }

          // Regular tab items
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleClick(item)}
              className="relative flex flex-col items-center gap-1 py-2 px-4 min-w-[60px]"
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors duration-200',
                    isActive ? 'text-white' : 'text-muted-foreground'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
