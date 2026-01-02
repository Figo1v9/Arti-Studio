import { useNavigate } from 'react-router-dom';
import { Sparkles, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils';
import { MobileNotifications } from './MobileNotifications';

interface MobileHeaderProps {
  title?: string;
  className?: string;
}

export function MobileHeader({ title, className }: MobileHeaderProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    // Navigate to user's profile using username, fallback to /profile
    navigate(user ? (profile?.username ? `/${profile.username}` : '/profile') : '/login');
  };

  // Get avatar URL from profile (user's custom avatar) or Firebase photoURL
  const avatarUrl = profile?.avatar_url || user?.photoURL;
  const displayName = profile?.full_name || user?.displayName || user?.email || 'U';

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 pt-[env(safe-area-inset-top)]",
      className
    )}>
      <div className="h-14 flex items-center justify-between px-4">
        {/* Left: Logo */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center min-h-[44px]"
        >
          <img
            src="/arti_studio.png"
            alt="Arti Studio"
            className="h-7 w-auto"
          />
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <MobileNotifications userId={user?.uid} />

          {/* Profile / Settings */}
          <button
            onClick={handleProfileClick}
            className="p-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors bg-transparent min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Profile"
          >
            {user ? (
              avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-7 h-7 rounded-lg object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            ) : (
              <Settings className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
