import { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Helmet } from "react-helmet-async";
import { Flame, TrendingUp, Eye, Copy } from "lucide-react";
import { useGallery, useSimilarImages } from "@/hooks/useGallery";
import { useModalHistory } from "@/hooks/useModalHistory";
import { GalleryImage } from "@/types/gallery";
import { ImageModal } from "@/components/gallery/ImageModal";
import { MobileImageModal } from "@/components/mobile/MobileImageModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { getTrendingImages } from "@/services/recommendations.service";
import { trackInteraction } from "@/services/recommendations.service";
import { SEOService } from "@/services/seo/seo.service";

export default function TrendsPage() {
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Modal history for back button support
  const { openWithHistory } = useModalHistory(
    selectedImage !== null,
    () => setSelectedImage(null),
    'trends-modal'
  );

  // Fetch gallery images (for local fallback)
  const { data: galleryImages = [], isLoading: isGalleryLoading } = useGallery();

  // Fetch trending images directly from server (pre-computed scores)
  // Long cache time since scores are updated every 15-30 minutes server-side
  const { data: trendingImages = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trending-images'],
    queryFn: () => getTrendingImages(50),
    staleTime: 1000 * 60 * 30, // 30 minutes (matches server update interval)
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const isLoading = isGalleryLoading || isTrendingLoading;

  // Get similar images for the selected image
  const { data: similarFromDb } = useSimilarImages(selectedImage);

  // Fallback similar images calculation
  const similarImages = useMemo(() => {
    if (similarFromDb && similarFromDb.length > 0) return similarFromDb;
    if (!selectedImage) return [];

    // Use galleryImages for local similar finding
    return galleryImages
      .filter((img) =>
        img.id !== selectedImage.id &&
        (img.category === selectedImage.category ||
          img.tags.some(tag => selectedImage.tags.includes(tag)))
      )
      .slice(0, 6);
  }, [selectedImage, galleryImages, similarFromDb]);

  const handleImageClick = (image: GalleryImage) => {
    trackInteraction(image, 'view');
    setSelectedImage(image);
    openWithHistory(image.id);
  };

  const handleSimilarClick = (image: GalleryImage) => {
    setSelectedImage(image);
    openWithHistory(image.id);
  };

  // Calculate total stats for display
  const totalStats = useMemo(() => {
    if (!trendingImages || !Array.isArray(trendingImages)) return { views: 0, copies: 0 };

    return trendingImages.reduce((acc, img) => ({
      views: acc.views + (img.views || 0),
      copies: acc.copies + (img.copies || 0),
    }), { views: 0, copies: 0 });
  }, [trendingImages]);

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

    return {
      title: `Trending AI Generated Art & Creative Prompts - ${SEOService.SITE_NAME}`,
      description: `Discover the hottest, most popular AI prompt creations and images trending this week on ${SEOService.SITE_NAME}. Check views, copies, and copy prompts.`,
      url: `${SEOService.SITE_URL}/trends`,
      image: trendingImages[0]?.url || SEOService.DEFAULT_OG_IMAGE,
      type: 'website' as const,
      keywords: ['Trending AI Art', 'Popular AI Prompts', 'Midjourney Prompts', 'Stable Diffusion', 'Arti Studio Trends'],
    };
  }, [selectedImage, trendingImages]);

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
          category: selectedImage.category || undefined,
          tags: selectedImage.tags,
          views: selectedImage.views,
          copies: selectedImage.copies,
          createdAt: selectedImage.createdAt,
        })
      );
    } else {
      list.push(
        SEOService.generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Trending', url: '/trends' }
        ])
      );
    }
    return list;
  }, [selectedImage]);

  return (
    <>
      <Helmet>
        {seoData && <title>{seoData.title}</title>}
        {seoData && Object.entries(SEOService.generateMetaTags(seoData)).map(([name, content]) => {
          if (name === 'title') return null;
          if (name.startsWith('og:')) {
            return <meta key={name} property={name} content={content} />;
          }
          return <meta key={name} name={name} content={content} />;
        })}
        {seoData?.url && <link rel="canonical" href={seoData.url} />}
        {schemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <div className="h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-none p-4 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
                Trending Now
              </h1>
              <p className="text-sm text-muted-foreground">
                The hottest prompts this week
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-muted-foreground">{trendingImages.length} trending</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-muted-foreground">{totalStats.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Copy className="w-4 h-4 text-green-400" />
              <span className="text-muted-foreground">{totalStats.copies.toLocaleString()} copies</span>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="flex-1 min-h-0 px-2 md:px-8 pb-8">
          <GalleryGrid
            images={trendingImages}
            onImageClick={handleImageClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      {isMobile ? (
        <MobileImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          similarImages={similarImages}
          onSimilarClick={handleSimilarClick}
        />
      ) : (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          similarImages={similarImages}
          onSimilarClick={handleSimilarClick}
        />
      )}
    </>
  );
}
