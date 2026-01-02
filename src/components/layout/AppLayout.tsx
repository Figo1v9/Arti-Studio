import { useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, getCategorySlug } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { MobileCategoryBar } from '@/components/mobile/MobileCategoryBar';
import { Category } from '@/types/gallery';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGallery } from '@/hooks/useGallery';
import { useSearch } from '@/hooks/useSearch';
import { EmailVerificationBanner } from '@/components/auth';

// Lazy load potentially heavy SearchModal
const SearchModal = lazy(() => import('@/components/search/SearchModal').then(module => ({ default: module.SearchModal })));

export function AppLayout() {
    const isMobile = useIsMobile();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const location = useLocation();
    const outlet = useOutlet();
    const navigate = useNavigate();

    // PERFORMANCE FIX: We no longer fetch ALL images for client-side search.
    // Search is now server-side within the SearchModal.
    // const { data: images = [] } = useGallery(searchOpen); <-- REMOVED

    // We use useSearch just to read/write URL params for the Sidebar
    const { selectedCategory, setSelectedCategory, query, setQuery } = useSearch([]); // Pass empty array as we don't filter here anymore

    const handleSearchFocus = () => {
        setSearchOpen(true);
    };

    if (isMobile) {
        const showCategoryBar = location.pathname === '/explore' ||
            location.pathname.startsWith('/category/') ||
            location.pathname.startsWith('/image/');

        return (
            <div className="min-h-[100dvh] bg-background no-select">
                {/* Email Verification Banner */}
                <EmailVerificationBanner />

                {/* Fixed Header */}
                <MobileHeader className="z-50" />

                {/* Fixed Category Bar */}
                {showCategoryBar && (
                    <MobileCategoryBar
                        selectedCategory={(() => {
                            const match = location.pathname.match(/^\/category\/([^/]+)/);
                            return match ? decodeURIComponent(match[1]) as Category : selectedCategory;
                        })()}
                        onCategoryChange={(cat) => {
                            if (cat) {
                                navigate(`/category/${getCategorySlug(cat)}`);
                            } else {
                                navigate('/explore');
                            }
                        }}
                    />
                )}

                {/* Main Content - scrollable area */}
                <main
                    data-scroll-container
                    className={cn(
                        "overflow-y-auto h-[100dvh] pb-24 transition-[padding] duration-200",
                        showCategoryBar
                            ? "pt-[calc(7rem+env(safe-area-inset-top))]" // Header (3.5) + Bar (3.5)
                            : "pt-[calc(3.5rem+env(safe-area-inset-top))]" // Header only
                    )}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {outlet}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Fixed Bottom Navigation */}
                <BottomNav onSearchClick={() => setSearchOpen(true)} />

                {/* Search Modal */}
                <Suspense fallback={null}>
                    <SearchModal
                        isOpen={searchOpen}
                        onClose={() => setSearchOpen(false)}
                        query={query}
                        onQueryChange={setQuery}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        // images={images} <-- Removed
                        onImageSelect={(image) => {
                            setSearchOpen(false);
                            navigate(`/explore?imageId=${image.id}`);
                        }}
                    />
                </Suspense>
            </div>
        );
    }

    return (
        <>
            <MainLayout
                sidebarCollapsed={sidebarCollapsed}
                sidebar={
                    <Sidebar
                        selectedCategory={selectedCategory}
                        onCategoryChange={(cat) => {
                            setSelectedCategory(cat);
                            if (cat) {
                                navigate(`/category/${getCategorySlug(cat)}`);
                            } else {
                                navigate('/explore');
                            }
                        }}
                        onSearchFocus={handleSearchFocus}
                        isCollapsed={sidebarCollapsed}
                        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                }
            >
                {/* Email Verification Banner */}
                <EmailVerificationBanner />

                {/* Persistent Header for Gallery/Home pages */}
                {/* We show header only on home, category, and image routes */}
                {(location.pathname === '/' ||
                    location.pathname === '/explore' ||
                    location.pathname.startsWith('/category/') ||
                    location.pathname.startsWith('/image/')) && (
                        <Header
                            selectedCategory={(() => {
                                const match = location.pathname.match(/^\/category\/([^/]+)/);
                                return match ? decodeURIComponent(match[1]) as Category : selectedCategory;
                            })()}
                            onCategoryChange={(cat) => {
                                if (cat) {
                                    navigate(`/category/${getCategorySlug(cat)}`);
                                } else {
                                    navigate('/explore');
                                }
                            }}
                        />
                    )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {outlet}
                    </motion.div>
                </AnimatePresence>
            </MainLayout>

            <Suspense fallback={null}>
                <SearchModal
                    isOpen={searchOpen}
                    onClose={() => setSearchOpen(false)}
                    query={query}
                    onQueryChange={setQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    // images={images} <-- Removed
                    onImageSelect={(image) => {
                        setSearchOpen(false);
                        navigate(`/explore?imageId=${image.id}`);
                    }}
                />
            </Suspense>
        </>
    );
}
