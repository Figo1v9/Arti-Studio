import React from 'react';
import Masonry from 'react-masonry-css';
import { GalleryImage } from '@/types/gallery';
import { GalleryItem } from './GalleryItem';
import { GallerySkeleton } from './GallerySkeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  isLoading?: boolean;
  showEmptyState?: boolean;
  emptyStateVariant?: 'gallery' | 'search' | 'favorites';
  searchQuery?: string;
  onClearSearch?: () => void;
}

// Responsive breakpoints for masonry columns
const breakpointColumns = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 2,
};

export const GalleryGrid = React.memo(function GalleryGrid({
  images,
  onImageClick,
  isLoading,
  showEmptyState = true,
  emptyStateVariant = 'gallery',
  searchQuery,
  onClearSearch
}: GalleryGridProps) {
  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (images.length === 0) {
    if (!showEmptyState) return null;

    // Show search-specific empty state if there's a query
    if (searchQuery && emptyStateVariant === 'search') {
      return (
        <EmptyState
          variant="search"
          title="No results found"
          description={`We couldn't find anything for "${searchQuery}". Try different keywords or browse categories.`}
          secondaryAction={onClearSearch ? { label: 'Clear search', onClick: onClearSearch } : undefined}
        />
      );
    }

    // Show favorites empty state
    if (emptyStateVariant === 'favorites') {
      return (
        <EmptyState
          variant="favorites"
          title="No favorites yet"
          description="Start saving images you love by tapping the heart icon. They'll appear here for easy access."
        />
      );
    }

    // Default gallery empty state
    return (
      <EmptyState
        variant="gallery"
        title="No images found"
        description="Try changing the category or search with different keywords to discover amazing AI art."
      />
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {images.map((image) => (
        <GalleryItem
          key={image.id}
          image={image}
          onClick={onImageClick}
        />
      ))}
    </Masonry>
  );
});

