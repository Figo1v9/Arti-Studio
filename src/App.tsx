import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/components/auth";
import { LoginPage, RegisterPage, AuthCallback, ForgotPasswordPage, AuthAnimationWrapper } from "@/components/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { lazy, Suspense, useEffect } from "react";
import { AnnouncementBar } from "@/components/common/AnnouncementBar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { initGA, trackPageView } from "@/lib/analytics";
import { useDevToolsProtection } from "@/hooks/useDevToolsProtection";

// Static files (sitemap.xml, robots.txt, etc.) are handled directly by Vercel
// through rewrites in vercel.json - NO React Router handling needed

/**
 * Reserved paths that should NOT be treated as usernames
 * This is used for validation in other parts of the app
 */
export const RESERVED_PATHS = new Set([
  'sitemap.xml', 'robots.txt', 'ads.txt', 'manifest.json', 'favicon.ico', 'sw.js',
  'explore', 'following', 'category', 'image', 'trends', 'favorites', 'search',
  'tag', 'profile', 'user', 'login', 'register', 'forgot-password', 'auth',
  'privacy', 'terms', 'about', 'contact', 'admin-mk-dashboard',
]);


// Lazy Loaded Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const FollowingPage = lazy(() => import("./pages/FollowingPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const TrendsPage = lazy(() => import("./pages/TrendsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const TagPage = lazy(() => import("./pages/TagPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Legal & Info Pages (Required for AdSense)
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/legal/TermsOfServicePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

// Cookie Consent Banner (GDPR Compliance)
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";

// Admin Lazy Loaded Pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UsersManagement = lazy(() => import("./pages/admin/users/UsersManagement"));
const GalleryManagement = lazy(() => import("./pages/admin/gallery/GalleryManagement"));
const CategoriesManagement = lazy(() => import("./pages/admin/categories/CategoriesManagement"));
const NotificationsManagement = lazy(() => import("./pages/admin/notifications/NotificationsManagement"));
const SettingsPage = lazy(() => import("./pages/admin/settings/SettingsPage"));

// New Admin Phases
const AnalyticsDashboard = lazy(() => import("./pages/admin/analytics/AnalyticsDashboard"));
const SecurityPage = lazy(() => import("./pages/admin/security/SecurityPage"));
const ReportsPage = lazy(() => import("./pages/admin/moderation/ReportsPage"));
const MarketingPage = lazy(() => import("./pages/admin/marketing/MarketingPage"));
const EmbeddingsCleanup = lazy(() => import("./pages/admin/EmbeddingsCleanup"));


/**
 * QueryClient Configuration - Optimized for Scale (1M+ users)
 * 
 * Key optimizations:
 * - staleTime: 5 minutes - Reduces unnecessary refetches by ~80%
 * - gcTime: 30 minutes - Keeps data in cache longer
 * - refetchOnWindowFocus: false - Prevents refetch storms
 * - retry: Smart retry with exponential backoff
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache (formerly cacheTime)
      refetchOnWindowFocus: false, // Prevent refetch on tab switch
      refetchOnReconnect: 'always', // Refetch when network reconnects
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        // Retry max 2 times for server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});

// Protected route component for admin
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  // Check local admin session as fallback with Signature Verification
  const adminSession = localStorage.getItem('admin_session');
  let isLocalAdmin = false;

  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

      if (ADMIN_EMAIL && ADMIN_PASSWORD) {
        const expectedSignature = btoa(`${session.email}-${session.timestamp}-${ADMIN_PASSWORD}`);
        const isValid =
          session.isAdmin &&
          session.email === ADMIN_EMAIL &&
          session.signature === expectedSignature &&
          (Date.now() - session.timestamp < 24 * 60 * 60 * 1000); // 24h expiry

        if (isValid) {
          isLocalAdmin = true;
        } else {
          // Invalid signature - clear it
          localStorage.removeItem('admin_session');
        }
      }
    } catch (e) {
      localStorage.removeItem('admin_session');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  // Security Check: access is denied if:
  // 1. User is not logged in AND not a local admin
  // 2. User IS logged in but is NOT an admin AND not a local admin
  const isAuthorized = (user && isAdmin) || isLocalAdmin;

  if (!isAuthorized) {
    return <Navigate to="/admin-mk-dashboard/login" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
        </div>
      }
    >
      <Routes>
        {/* Static files (sitemap.xml, robots.txt, etc.) are NOT here
         * They are handled by Vercel rewrites in vercel.json
         * DO NOT add React Router routes for static files! */}

        {/* Landing Page (No Layout) */}
        <Route path="/" element={<LandingPage />} />

        {/* App Layout Routes (Shared Sidebar) */}
        <Route element={<AppLayout />}>
          <Route path="/explore" element={<Index />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/category/:category" element={<Index />} />
          <Route path="/image/:imageId" element={<Index />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tag/:tagName" element={<TagPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:username" element={<ProfilePage />} />
          <Route path="/user/:username/collection/:slug" element={<CollectionPage />} />

          {/* Dynamic username route - MUST BE LAST in this group */}
          <Route path="/:username" element={<ProfilePage />} />
        </Route>

        {/* Auth Routes with Shared Layout Animations */}
        <Route element={<AuthAnimationWrapper />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Legal & Info Pages (Required for AdSense) */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin Routes */}
        <Route path="/admin-mk-dashboard/login" element={<AdminLogin />} />
        <Route
          path="/admin-mk-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="moderation" element={<ReportsPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="notifications" element={<NotificationsManagement />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="cleanup" element={<EmbeddingsCleanup />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// Wrapper component to initialize analytics, notifications & protection
function AppWithAnalytics({ children }: { children: React.ReactNode }) {
  // DevTools Protection (Production Only)
  useDevToolsProtection();

  useEffect(() => {
    // Initialize Google Analytics on mount
    initGA();

    // Initialize Foreground Notification Listener
    const initNotifications = async () => {
      try {
        if ('serviceWorker' in navigator) {
          // Service worker registration handled elsewhere
        }

        const { onMessageListener } = await import('@/services/notifications.service');
        interface NotificationPayload {
          notification?: { title?: string; body?: string };
        }
        const payload = (await onMessageListener()) as NotificationPayload;
        if (payload?.notification) {
          // Foreground notification received
          toast(payload.notification.title || 'New Notification', {
            description: payload.notification.body,
            duration: 5000,
          });
        }
      } catch (err) {
        console.warn('Notification listener setup failed:', err);
      }
    };

    initNotifications();
  }, []);

  return <>{children}</>;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <AppWithAnalytics>
              <Toaster />
              <SonnerToaster position="top-center" theme="dark" style={{ zIndex: 99999 }} />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <AnnouncementBar />
                <AnimatedRoutes />
                <CookieConsentBanner />
              </BrowserRouter>
            </AppWithAnalytics>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
