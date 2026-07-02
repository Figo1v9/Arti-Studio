import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { useDebounce } from 'react-use';
import { Helmet } from 'react-helmet-async';
import { SEOService } from '@/services/seo/seo.service';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { useContentProtection } from '@/hooks/useContentProtection';
import { useSearch } from '@/hooks/useSearch';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSimilarImages, useInfiniteGallery, useImage } from '@/hooks/useGallery';
import { useModalHistory } from '@/hooks/useModalHistory';
import { useCategories } from '@/hooks/useCategories';
import { useRecommendations, useMixedFeed, useTrackInteraction } from '@/hooks/useRecommendations';
import { GalleryImage, Category } from '@/types/gallery';
import { cn, findCategoryBySlug, getCategorySlug } from '@/lib/utils';
import { useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth';

// Lazy load modals to reduce initial bundle size
const ImageModal = lazy(() => import('@/components/gallery/ImageModal').then(module => ({ default: module.ImageModal })));
const SearchModal = lazy(() => import('@/components/search/SearchModal').then(module => ({ default: module.SearchModal })));
const MobileSearchModal = lazy(() => import('@/components/mobile/MobileSearchModal').then(module => ({ default: module.MobileSearchModal })));
const MobileImageModal = lazy(() => import('@/components/mobile/MobileImageModal').then(module => ({ default: module.MobileImageModal })));

export default function Index() {
  const isMobile = useIsMobile();
  const { categories } = useCategories();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Content protection
  useContentProtection();

  // Modal history for back button support
  const { openWithHistory } = useModalHistory(
    selectedImage !== null,
    () => setSelectedImage(null),
    'image-modal'
  );

  // Get route params
  const { category: routeCategory } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // Imported
  const isFollowingFeed = location.pathname === '/following';

  const { user } = useAuth(); // Import useAuth to get user

  // 1. Setup Search Hook (Moved up)
  // We pass empty array because we don't use client-side filtering anymore
  const {
    query,
    setQuery,
  } = useSearch([]);

  // 2. Debounce Query for Server Request
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    500,
    [query]
  );

  // Determine active category: Route param takes precedence, then search param
  // When using clean URLs, find the actual category by matching slug
  const decodedRouteCategory = routeCategory ? decodeURIComponent(routeCategory) : null;
  const matchedCategory = decodedRouteCategory ? findCategoryBySlug(categories, decodedRouteCategory) : null;
  const activeCategory = isFollowingFeed ? 'following' : ((matchedCategory?.id as Category) || (searchParams.get('category') as Category) || null);

  // 3. Infinite Gallery with pagination (Now accepts query)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteGallery(activeCategory, user?.uid, debouncedQuery);

  // Flatten pages -> This IS the server-filtered list
  const images = useMemo(() => {
    const allImages = data?.pages.flatMap(page => page) || [];
    // Deduplicate by ID
    const seen = new Set();
    return allImages.filter(img => {
      if (seen.has(img.id)) return false;
      seen.add(img.id);
      return true;
    });
  }, [data]);

  // === RECOMMENDATIONS SYSTEM ===
  const { data: recommendations = [] } = useRecommendations(images, 12);
  const { trackView } = useTrackInteraction();
  const mixedFeed = useMixedFeed(images, recommendations);
  // === END RECOMMENDATIONS ===

  // Deep linking for image
  const params = useParams<{ imageId: string }>();
  const deepLinkImageId = searchParams.get('imageId') || params.imageId;

  // Fetch image specifically for deep link (if not in current feed)
  const { data: fetchedImage } = useImage(deepLinkImageId || null);

  useEffect(() => {
    if (!deepLinkImageId) return;

    // 1. Try to find in current loaded images (Fastest)
    const imgInFeed = images.find(i => i.id === deepLinkImageId);
    if (imgInFeed) {
      setSelectedImage(imgInFeed);
      return;
    }

    // 2. Fallback to fetched image
    if (fetchedImage) {
      setSelectedImage(fetchedImage);
    }
  }, [deepLinkImageId, images, fetchedImage]);

  const closeImageModal = () => {
    setSelectedImage(null);
    // Remove imageId from URL without refreshing
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('imageId');
    setSearchParams(newParams, { replace: true });

    // If we were on a direct image route /image/:id, go back to explore or category
    if (window.location.pathname.startsWith('/image/')) {
      navigate(activeCategory ? `/category/${getCategorySlug(activeCategory)}` : '/explore', { replace: true });
    }
  };

  const handleImageClick = useMemo(() => (image: GalleryImage) => {
    trackView(image);
    setSelectedImage(image);
    // Push history state so back button closes modal
    openWithHistory(image.id);
    // Add imageId to URL
    setSearchParams(prev => {
      prev.set('imageId', image.id);
      return prev;
    }, { replace: true });
  }, [trackView, setSearchParams, openWithHistory]);

  // Search functionality hooks
  // Search hooks moved up
  const filteredImages = images; // Backwards compatibility for render logic if needed, but displayImages handles it.

  // Sync route category with search hook (if needed for filtering logic)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(activeCategory);

  useEffect(() => {
    setSelectedCategory(activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (cat: Category | null) => {
    if (cat) {
      navigate(`/category/${getCategorySlug(cat)}`);
    } else {
      navigate('/explore');
    }
  };

  /* 
   * Unified Search Handler
   * Redirects all searches to the dedicated /search page for AI-powered results
   */
  const handleSearchQuery = (term: string) => {
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      setMobileSearchOpen(false);
      setSearchOpen(false);
    }
  };

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Use mixed feed when no category/query filter is applied
  const displayImages = useMemo(() => {
    // If we have a category or query, strictly show the Server Results (images)
    if (activeCategory || query) {
      return images;
    }
    // Only mix feed on the "Home" (All) view
    return mixedFeed.length > 0 ? mixedFeed : images;
  }, [activeCategory, query, images, mixedFeed]);

  // Get similar images for the selected image
  const { data: similarFromDb } = useSimilarImages(selectedImage);

  // Fallback similar images calculation
  const similarImages = useMemo(() => {
    if (similarFromDb && similarFromDb.length > 0) {
      return similarFromDb;
    }
    if (!selectedImage) return [];
    return images
      .filter((img) =>
        img.id !== selectedImage.id &&
        (img.category === selectedImage.category ||
          img.tags.some(tag => selectedImage.tags.includes(tag)))
      )
      .slice(0, 6);
  }, [selectedImage, images, similarFromDb]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSimilarClick = useMemo(() => (image: GalleryImage) => {
    trackView(image);
    setSelectedImage(image);
    openWithHistory(image.id);
    setSearchParams(prev => {
      prev.set('imageId', image.id);
      return prev;
    }, { replace: true });
  }, [trackView, setSearchParams, openWithHistory]);

  const handleSearchImageSelect = useMemo(() => (image: GalleryImage) => {
    trackView(image);
    setSelectedImage(image);
    openWithHistory(image.id);
    setSearchParams(prev => {
      prev.set('imageId', image.id);
      return prev;
    }, { replace: true });
  }, [trackView, setSearchParams, openWithHistory]);

  // Dynamic SEO Data calculation
  const seoData = useMemo(() => {
    if (selectedImage) {
      const title = `${selectedImage.title || 'AI Generated Art'} - ${SEOService.SITE_NAME}`;
      const description = selectedImage.prompt
        ? `${selectedImage.prompt.substring(0, 150)}...`
        : 'Discover AI-generated artwork and prompts at Arti Studio';
      const url = `${SEOService.SITE_URL}/image/${selectedImage.id}`;
      return {
        title,
        description,
        url,
        image: selectedImage.url,
        type: 'article' as const,
        keywords: [
          'AI Art',
          'AI Prompt',
          selectedImage.category || 'Digital Art',
          ...(selectedImage.tags || []).slice(0, 5)
        ],
        author: selectedImage.author || undefined,
        publishedTime: selectedImage.createdAt || undefined,
      };
    }

    if (activeCategory) {
      const catLabel = matchedCategory?.label || activeCategory;
      const title = `${catLabel} AI Prompts & Art - ${SEOService.SITE_NAME}`;
      const description = `Explore stunning ${catLabel.toLowerCase()} AI-generated images and prompts. Find inspiration for your ${catLabel.toLowerCase()} projects at ${SEOService.SITE_NAME}.`;
      const url = `${SEOService.SITE_URL}/category/${encodeURIComponent(activeCategory)}`;
      return {
        title,
        description,
        url,
        image: SEOService.DEFAULT_OG_IMAGE,
        type: 'website' as const,
        keywords: ['AI Art', 'AI Prompt', catLabel, 'Midjourney', 'Stable Diffusion'],
      };
    }

    if (query) {
      const title = `Search Results for "${query}" - ${SEOService.SITE_NAME}`;
      const description = `Explore stunning AI art and prompts related to "${query}" on ${SEOService.SITE_NAME}.`;
      const url = `${SEOService.SITE_URL}/search?q=${encodeURIComponent(query)}`;
      return {
        title,
        description,
        url,
        image: SEOService.DEFAULT_OG_IMAGE,
        type: 'website' as const,
      };
    }

    // Default Homepage
    return {
      title: 'Arti Studio - AI Art & Prompt Inspiration Platform',
      description: 'Discover stunning AI-generated images with prompts. Find inspiration for design, architecture, fashion, and coding on the #1 AI prompt platform.',
      url: SEOService.SITE_URL,
      image: SEOService.DEFAULT_OG_IMAGE,
      type: 'website' as const,
      keywords: ['AI Art', 'AI Prompts', 'Midjourney', 'Stable Diffusion', 'DALL-E', 'Prompt Engineering'],
    };
  }, [selectedImage, activeCategory, matchedCategory, query]);

  // Dynamic JSON-LD structured schemas
  const schemas = useMemo(() => {
    const list: any[] = [];
    if (selectedImage) {
      list.push(
        SEOService.generateImageSchema({
          id: selectedImage.id,
          title: selectedImage.title,
          prompt: selectedImage.prompt,
          url: selectedImage.url,
          author: selectedImage.author || undefined,
          authorUsername: selectedImage.authorUsername || undefined,
          category: selectedImage.category || undefined,
          tags: selectedImage.tags,
          views: selectedImage.views,
          copies: selectedImage.copies,
          createdAt: selectedImage.createdAt,
        })
      );
    } else if (activeCategory) {
      list.push(
        SEOService.generateCollectionSchema({
          id: activeCategory,
          name: matchedCategory?.label || activeCategory,
          description: `Explore the best ${matchedCategory?.label || activeCategory} AI prompts and art.`,
          imageCount: displayImages.length || undefined,
        })
      );
    } else if (!query) {
      // General schemas for homepage
      list.push(SEOService.generateWebsiteSchema());
      list.push(SEOService.generateOrganizationSchema());
    }
    return list;
  }, [selectedImage, activeCategory, matchedCategory, query, displayImages]);

  // Unified Render - Prevents layout thrashing/flickering
  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        {Object.entries(SEOService.generateMetaTags(seoData)).map(([name, content]) => {
          if (name === 'title') return null;
          if (name.startsWith('og:')) {
            return <meta key={name} property={name} content={content} />;
          }
          return <meta key={name} name={name} content={content} />;
        })}
        {seoData.url && <link rel="canonical" href={seoData.url} />}
        {schemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      {/* Main Content Area */}
      {/* Dynamic padding based on device to handle bottom navigation vs footer */}
      <div className={cn(
        "min-h-[50vh]",
        isMobile ? "px-4" : "pb-24 px-8"
      )}>
        <GalleryGrid
          images={displayImages}
          onImageClick={handleImageClick}
          isLoading={isLoading}
        />

        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} className="py-8 flex justify-center w-full">
          {isFetchingNextPage && (
            <div className={cn(
              "flex items-center gap-3",
              isMobile ? "px-4 py-2 rounded-full bg-white/5 border border-white/10" : ""
            )}>
              <div className={cn(
                "animate-spin rounded-full border-2 border-violet-500",
                isMobile ? "h-4 w-4 border-t-transparent" : "h-8 w-8 border-t-2 border-b-2"
              )} />
              {isMobile && <span className="text-sm text-muted-foreground">Loading more...</span>}
            </div>
          )}
        </div>
      </div>

      {/* Modals - Lazy Loaded & Conditionally Rendered */}
      {/* Note: Conditional rendering is acceptable here as modals are initially hidden */}
      <Suspense fallback={null}>
        {isMobile ? (
          <>
            <MobileSearchModal
              isOpen={mobileSearchOpen}
              onClose={() => setMobileSearchOpen(false)}
              query={query}
              onQueryChange={handleSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            <MobileImageModal
              image={selectedImage}
              onClose={closeImageModal}
              similarImages={similarImages}
              onSimilarClick={handleSimilarClick}
            />
          </>
        ) : (
          <>
            <SearchModal
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              query={query}
              onQueryChange={handleSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onImageSelect={handleSearchImageSelect}
            // images={images} <-- Removed
            />
            <ImageModal
              image={selectedImage}
              onClose={closeImageModal}
              similarImages={similarImages}
              onSimilarClick={handleSimilarClick}
            />
          </>
        )}
      </Suspense>
    </>
  );
}
