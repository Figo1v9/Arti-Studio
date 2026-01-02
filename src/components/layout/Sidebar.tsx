
import { cn } from '@/lib/utils';
import { Category } from '@/types/gallery';
import { useAuth } from '@/components/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { NAV_ITEMS } from '@/constants/navigation';

import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarSearch } from './sidebar/SidebarSearch';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarCategories } from './sidebar/SidebarCategories';
import { SidebarUser } from './sidebar/SidebarUser';
import { SidebarAuth } from './sidebar/SidebarAuth';

interface SidebarProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  onSearchFocus: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  selectedCategory,
  onCategoryChange,
  onSearchFocus,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Optimistic UI: Cache user data in localStorage for instant display
  const [cachedUser, setCachedUser] = useState(() => {
    try {
      const saved = localStorage.getItem('arti_user_cache');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Sync cache when user changes
  useEffect(() => {
    if (user) {
      const data = { displayName: user.displayName, email: user.email, uid: user.uid, photoURL: user.photoURL };
      localStorage.setItem('arti_user_cache', JSON.stringify(data));
      setCachedUser(data);
    } else if (!loading) {
      localStorage.removeItem('arti_user_cache');
      setCachedUser(null);
    }
  }, [user, loading]);

  const displayedUser = user || cachedUser;
  const showSkeleton = loading && !cachedUser;

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('arti_user_cache');
    setCachedUser(null);
    signOut();
    navigate('/explore');
    toast.success('Signed out successfully');
  }, [signOut, navigate]);

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.requiresAuth && !displayedUser) {
      toast.info('Please sign in to use this feature');
      navigate('/login');
      return;
    }

    if (item.id === 'favorites') {
      navigate('/favorites');
      return;
    }

    if (item.id === 'following') {
      navigate('/following');
      return;
    }

    if (item.id === 'trends') {
      navigate('/trends');
      return;
    }

    if (item.id === 'profile') {
      if (profile?.username) {
        navigate(`/${profile.username}`);
      } else {
        navigate('/profile');
      }
      return;
    }

    if (item.id === 'explore') {
      navigate('/explore');
      return;
    }

    navigate('/explore');
    onCategoryChange(null);
  };

  const handleSidebarClick = (e: React.MouseEvent) => {
    if (isCollapsed) {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) {
        return;
      }
      onToggleCollapse();
    }
  };

  return (
    <aside
      onClick={handleSidebarClick}
      className={cn(
        'h-full flex flex-col transition-all duration-300 ease-out flex-shrink-0',
        'glass glass-gradient-underlay border-r border-border/50',
        'w-full',
        isCollapsed && 'cursor-pointer'
      )}
    >
      <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />

      <SidebarSearch isCollapsed={isCollapsed} onSearchFocus={onSearchFocus} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin pb-4">
        <SidebarNavigation
          isCollapsed={isCollapsed}
          selectedCategory={selectedCategory}
          onNavClick={handleNavClick}
        />

        <SidebarCategories
          isCollapsed={isCollapsed}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Bottom Section: User or Auth */}
      {displayedUser || showSkeleton ? (
        <SidebarUser
          isCollapsed={isCollapsed}
          user={displayedUser}
          profile={profile}
          showSkeleton={showSkeleton}
          onSignOut={handleSignOut}
          onToggleCollapse={onToggleCollapse}
        />
      ) : !loading && (
        <SidebarAuth isCollapsed={isCollapsed} />
      )}
    </aside>
  );
}
