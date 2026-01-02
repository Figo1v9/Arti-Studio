export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  prompt: string;
  category: Category;
  tags: string[];
  author: string;
  createdAt: string;
  views: number;
  likes: number;
  downloads: number;
  copies: number;
  aspectRatio: number;
  authorId?: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorVerification?: 'none' | 'blue' | 'gold';
}

export type Category =
  | 'design'
  | 'architecture'
  | 'interior'
  | 'fashion'
  | 'art'
  | 'coding'
  | 'lovable'
  | 'bolt'
  | 'base44'
  | 'vite'
  | (string & {});

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'design', label: 'Design', icon: 'Palette', color: 'purple' },
  { id: 'architecture', label: 'Architecture', icon: 'Building2', color: 'blue' },
  { id: 'interior', label: 'Interior', icon: 'Sofa', color: 'amber' },
  { id: 'fashion', label: 'Fashion', icon: 'Shirt', color: 'pink' },
  { id: 'art', label: 'Visual Art', icon: 'Brush', color: 'red' },
  { id: 'coding', label: 'Coding', icon: 'Code', color: 'green' },
  { id: 'lovable', label: 'Lovable', icon: 'Heart', color: 'rose' },
  { id: 'bolt', label: 'Bolt', icon: 'Zap', color: 'yellow' },
  { id: 'base44', label: 'Base44', icon: 'Boxes', color: 'cyan' },
  { id: 'vite', label: 'Vite', icon: 'Flame', color: 'orange' },
];

export interface SearchFilters {
  query: string;
  category: Category | null;
  tags: string[];
}
