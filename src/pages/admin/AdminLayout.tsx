import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Images,
    FolderOpen,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Sparkles,
    Bell,
    BarChart3,
    ShieldAlert,
    Flag,
    Megaphone,
    Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
    { path: '/admin-mk-dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin-mk-dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin-mk-dashboard/users', icon: Users, label: 'Users' },
    { path: '/admin-mk-dashboard/security', icon: ShieldAlert, label: 'Security' },
    { path: '/admin-mk-dashboard/moderation', icon: Flag, label: 'Reports' },
    { path: '/admin-mk-dashboard/gallery', icon: Images, label: 'Gallery' },
    { path: '/admin-mk-dashboard/categories', icon: FolderOpen, label: 'Categories' },
    { path: '/admin-mk-dashboard/marketing', icon: Megaphone, label: 'Marketing' },
    { path: '/admin-mk-dashboard/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin-mk-dashboard/cleanup', icon: Database, label: 'AI Migration' },
    { path: '/admin-mk-dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
    const { signOut, profile, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        // Check if we are in a local admin session
        const adminSession = localStorage.getItem('admin_session');

        if (adminSession) {
            // If local admin, just clear that session
            localStorage.removeItem('admin_session');
            toast.success('Logged out from admin panel');
            navigate('/admin-mk-dashboard/login');
        } else {
            // If real admin user, sign out completely
            await signOut();
            navigate('/admin-mk-dashboard/login');
        }
    };

    // Verify local session integrity
    React.useEffect(() => {
        const adminSession = localStorage.getItem('admin_session');
        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
                const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

                // Reconstruct signature to verify
                const expectedSignature = btoa(`${session.email}-${session.timestamp}-${ADMIN_PASSWORD}`);

                const isValid =
                    session.email === ADMIN_EMAIL &&
                    session.signature === expectedSignature &&
                    (Date.now() - session.timestamp < 24 * 60 * 60 * 1000); // 24h expiry

                if (!isValid) {
                    console.warn('Invalid or expired admin session detected.');
                    localStorage.removeItem('admin_session');
                    // Only redirect if NOT authenticated via Firebase either
                    if (!isAdmin) {
                        navigate('/admin-mk-dashboard/login');
                    }
                }
            } catch (e) {
                localStorage.removeItem('admin_session');
            }
        }
    }, [isAdmin, navigate]);

    return (
        <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
                <div style={{ height: 'env(safe-area-inset-top)' }} className="w-full bg-slate-900/50" />
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <span className="font-bold text-white">Admin Panel</span>
                    </div>
                    <div className="w-9" />
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div className="lg:grid lg:h-full lg:grid-cols-[auto_1fr] lg:grid-rows-1">
                {/* Sidebar */}
                <aside
                    className={cn(
                        // Common styles
                        "z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-r border-white/10",
                        // Mobile Styles (Fixed)
                        "fixed top-0 left-0 h-full max-lg:w-64 max-lg:shadow-2xl",
                        mobileMenuOpen ? "translate-x-0" : "max-lg:-translate-x-full",
                        // Desktop Styles (Grid Item)
                        "lg:static lg:h-full lg:translate-x-0",
                        sidebarOpen ? "lg:w-64" : "lg:w-20"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                            {sidebarOpen && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-white">Admin Panel</h1>
                                        <p className="text-xs text-gray-400">Enterprise Edition</p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:flex p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft className={cn(
                                    "w-4 h-4 transition-transform",
                                    !sidebarOpen && "rotate-180"
                                )} />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30"
                                            : "text-gray-400 hover:text-white hover:bg-white/5",
                                        !sidebarOpen && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Section */}
                        <div className="p-4 border-t border-white/10 flex-shrink-0">
                            {sidebarOpen ? (
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-medium">
                                            {isAdmin ? (profile?.full_name?.charAt(0) || 'A') : 'S'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {isAdmin ? (profile?.full_name || 'Admin') : 'System Administrator'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {isAdmin ? profile?.email : 'Local Access'}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                className={cn(
                                    "w-full text-red-400 hover:text-red-300 hover:bg-red-500/10",
                                    !sidebarOpen && "px-0 justify-center"
                                )}
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                {sidebarOpen && <span>Logout</span>}
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={cn(
                        "h-full overflow-y-auto overflow-x-hidden pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0",
                        "transition-all duration-300"
                    )}
                >
                    <div className="p-4 lg:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
