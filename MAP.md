# 🗺️ Prompt Life (Arti Studio) - Project Map

> **آخر تحديث:** 2025-12-25
> **نوع المشروع:** AI Prompt Inspiration Gallery Platform
> **الإصدار:** 0.0.0

---

## 📋 جدول المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [التقنيات المستخدمة](#-التقنيات-المستخدمة)
3. [هيكل المشروع](#-هيكل-المشروع)
4. [قاعدة البيانات](#-قاعدة-البيانات)
5. [تدفق البيانات](#-تدفق-البيانات)
6. [المكونات الرئيسية](#-المكونات-الرئيسية)
7. [الـ Hooks](#-الـ-hooks)
8. [الخدمات (Services)](#-الخدمات-services)
9. [نظام الفئات](#-نظام-الفئات)
10. [نظام التوصيات](#-نظام-التوصيات)
11. [نظام المصادقة](#-نظام-المصادقة)
12. [لوحة التحكم (Admin)](#-لوحة-التحكم-admin)
13. [واجهة الموبايل](#-واجهة-الموبايل)
14. [نظام التصميم](#-نظام-التصميم)
15. [الـ Routes](#-الـ-routes)
16. [التكاملات الخارجية](#-التكاملات-الخارجية)
17. [ملاحظات تقنية](#-ملاحظات-تقنية)
18. [خريطة الملفات](#-خريطة-الملفات)

---

## 📖 نظرة عامة

**Arti Studio** هي منصة إلهام (Inspiration Platform) لعرض معرض صور AI مع الـ Prompts المرتبطة بها. المنصة لا تقوم بتوليد الصور، بل تعرضها مع prompts عالية الجودة مصنفة حسب المجال.

### الأهداف الرئيسية:
- ✅ عرض صور AI مع Prompts احترافية
- ✅ تصنيف متعدد (تصميم، عمارة، ديكور، أزياء، فنون، برمجة)
- ✅ بحث فوري وذكي
- ✅ نظام توصيات مخصص
- ✅ حماية المحتوى من النسخ
- ✅ واجهة Glassmorphism حديثة
- ✅ دعم كامل للموبايل

---

## 🛠 التقنيات المستخدمة

### Frontend Stack

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety |
| **Vite** | 5.4.19 | Build Tool |
| **TailwindCSS** | 3.4.17 | Styling |
| **Framer Motion** | 12.23.26 | Animations |
| **React Query** | 5.83.0 | State Management |
| **React Router** | 6.30.1 | Routing |
| **Radix UI** | Latest | UI Primitives (shadcn/ui) |

### Backend Stack

| التقنية | الاستخدام |
|---------|-----------|
| **Firebase** | Authentication (Email, Google) |
| **Supabase** | Database (PostgreSQL) + Realtime |
| **Cloudflare R2** | Image Storage |
| **Cloudflare Workers** | Image Upload API |
| **Gemini AI** | Smart Tag Generation |

### أدوات إضافية

| الأداة | الاستخدام |
|--------|-----------|
| **Lucide React** | Icons |
| **Sonner** | Toast Notifications |
| **Zod** | Validation |
| **React Hook Form** | Form Handling |
| **Recharts** | Charts (Admin) |
| **date-fns** | Date Formatting |

---

## 📁 هيكل المشروع

```
d:\lab\Prompt Life\
│
├── 📄 package.json              # Dependencies & Scripts
├── 📄 vite.config.ts            # Vite Configuration
├── 📄 tailwind.config.ts        # Tailwind Configuration
├── 📄 tsconfig.json             # TypeScript Config
├── 📄 index.html                # Entry HTML
│
├── 📁 src/                      # Source Code
│   ├── 📄 main.tsx              # React Entry Point
│   ├── 📄 App.tsx               # Main App + Routing
│   ├── 📄 index.css             # Global Styles + Design System
│   ├── 📄 vite-env.d.ts         # Vite Types
│   │
│   ├── 📁 components/           # UI Components
│   │   ├── 📁 auth/             # Authentication Components
│   │   ├── 📁 gallery/          # Gallery Components
│   │   ├── 📁 layout/           # Layout Components
│   │   ├── 📁 mobile/           # Mobile-specific Components
│   │   ├── 📁 search/           # Search Components
│   │   └── 📁 ui/               # shadcn/ui Components (50+)
│   │
│   ├── 📁 pages/                # Page Components
│   │   ├── 📄 Index.tsx         # Home/Gallery Page
│   │   ├── 📄 FavoritesPage.tsx # User Favorites
│   │   ├── 📄 TrendsPage.tsx    # Trending Images
│   │   ├── 📄 ProfilePage.tsx   # User Profile
│   │   ├── 📄 NotFound.tsx      # 404 Page
│   │   └── 📁 admin/            # Admin Dashboard
│   │
│   ├── 📁 hooks/                # Custom React Hooks
│   ├── 📁 services/             # API & Business Logic
│   ├── 📁 lib/                  # Utilities & Clients
│   ├── 📁 types/                # TypeScript Types
│   ├── 📁 constants/            # Constants & Config
│   └── 📁 scripts/              # Build Scripts
│
├── 📁 public/                   # Static Assets
├── 📁 cloudflare-worker/        # R2 Upload Worker
├── 📁 backUP-Close/             # Backup Files
└── 📁 dist/                     # Build Output
```

---

## 🗄 قاعدة البيانات

### Supabase Schema

#### 1. `profiles` - المستخدمين
```sql
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,           -- Firebase UID
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',      -- 'user' | 'admin'
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `gallery_images` - الصور
```sql
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT,
    prompt TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    author_id TEXT,                -- Firebase UID
    author_name TEXT,
    views INTEGER DEFAULT 0,
    copies INTEGER DEFAULT 0,
    aspect_ratio DECIMAL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `categories` - الفئات
```sql
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);
```

#### 4. `favorites` - المفضلة
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,         -- Firebase UID
    image_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);
```

#### 5. `site_stats` - إحصائيات الموقع
```sql
CREATE TABLE site_stats (
    id TEXT PRIMARY KEY DEFAULT 'main',
    total_views INTEGER DEFAULT 0,
    total_copies INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Realtime Subscriptions
- ✅ `gallery_images` - تحديث تلقائي عند إضافة/تعديل صور
- ✅ `categories` - مزامنة الفئات في الوقت الحقيقي

---

## 🔄 تدفق البيانات

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                           App.tsx                                │
│  ├── QueryClientProvider (React Query)                          │
│  ├── AuthProvider (Firebase Auth)                               │
│  └── BrowserRouter (React Router)                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AppLayout.tsx                             │
│  ├── useIsMobile() ─────────────────► Mobile/Desktop Switch     │
│  ├── useGallery() ──────────────────► Fetch Images + Realtime   │
│  └── useSearch() ───────────────────► URL Params Sync           │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│      Sidebar.tsx          │   │         Index.tsx              │
│  ├── useCategories()      │   │  ├── useInfiniteGallery()     │
│  ├── useAuth()            │   │  ├── useSimilarImages()       │
│  └── Navigation           │   │  ├── GalleryGrid component    │
└───────────────────────────┘   │  └── ImageModal component     │
                                └───────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Services Layer                            │
│  ├── gallery.service.ts ────────► Supabase CRUD                 │
│  ├── favorites.service.ts ──────► User Favorites                │
│  ├── recommendations.service.ts ► Smart Recommendations         │
│  ├── upload.service.ts ─────────► Cloudflare R2                 │
│  └── ai.service.ts ─────────────► Gemini Tag Generation         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        External APIs                             │
│  ├── Supabase (PostgreSQL + Realtime)                           │
│  ├── Firebase (Authentication)                                   │
│  ├── Cloudflare R2 (Storage)                                    │
│  └── Google Gemini (AI)                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 المكونات الرئيسية

### Layout Components (`src/components/layout/`)

| Component | File | Description |
|-----------|------|-------------|
| **AppLayout** | `AppLayout.tsx` | Layout manager - Desktop/Mobile switch |
| **Sidebar** | `Sidebar.tsx` | Navigation + Categories (Glassmorphism) |
| **Header** | `Header.tsx` | Category pills horizontal scroll |
| **MainLayout** | `MainLayout.tsx` | Content wrapper with sidebar |

#### Sidebar.tsx - التفاصيل
```typescript
interface SidebarProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  onSearchFocus: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Key Features:
// - Dynamic category loading from DB
// - User caching for instant display
// - Collapsible sidebar with animations
// - Glassmorphism styling
// - Sign out with confirmation dialog
```

### Gallery Components (`src/components/gallery/`)

| Component | File | Description |
|-----------|------|-------------|
| **GalleryGrid** | `GalleryGrid.tsx` | Masonry grid layout |
| **GalleryItem** | `GalleryItem.tsx` | Image card with hover actions |
| **ImageModal** | `ImageModal.tsx` | Full image view + similar images |
| **GallerySkeleton** | `GallerySkeleton.tsx` | Loading skeleton |

#### GalleryItem.tsx - التفاصيل
```typescript
interface GalleryItemProps {
  image: GalleryImage;
  onClick: () => void;
}

// Features:
// - Lazy loading with blur placeholder
// - Hover overlay with actions
// - Copy prompt button
// - Add to favorites button
// - Category badge
// - View count tracking
```

#### ImageModal.tsx - التفاصيل
```typescript
interface ImageModalProps {
  image: GalleryImage | null;
  onClose: () => void;
  similarImages: GalleryImage[];
  onSimilarClick: (image: GalleryImage) => void;
}

// Features:
// - Full-size image display
// - Prompt copy functionality
// - Share feature (Web Share API)
// - Similar images carousel
// - View & copy tracking
// - SEO meta tags
```

### Search Components (`src/components/search/`)

| Component | File | Description |
|-----------|------|-------------|
| **SearchModal** | `SearchModal.tsx` | Desktop search overlay |
| **SearchBar** | `SearchBar.tsx` | Search input component |

#### SearchModal.tsx - التفاصيل
```typescript
// Features:
// - Keyboard shortcut (⌘K / Ctrl+K)
// - Category filter pills
// - Real-time search results
// - Image selection to modal
// - Recent searches (planned)
```

### Mobile Components (`src/components/mobile/`)

| Component | File | Description |
|-----------|------|-------------|
| **MobileHeader** | `MobileHeader.tsx` | Mobile top bar |
| **BottomNav** | `BottomNav.tsx` | Bottom navigation bar |
| **MobileMenu** | `MobileMenu.tsx` | Side drawer menu |
| **MobileImageModal** | `MobileImageModal.tsx` | Mobile image view |
| **MobileSearchModal** | `MobileSearchModal.tsx` | Mobile search |

### Auth Components (`src/components/auth/`)

| Component | File | Description |
|-----------|------|-------------|
| **AuthContext** | `AuthContext.tsx` | Auth state provider |
| **LoginPage** | `LoginPage.tsx` | Login form |
| **RegisterPage** | `RegisterPage.tsx` | Registration form |
| **AuthCallback** | `AuthCallback.tsx` | OAuth callback handler |

---

## 🪝 الـ Hooks

### `useGallery.ts`
```typescript
// Fetch all gallery images with realtime updates
export function useGallery() {
  // Sets up Supabase realtime subscription
  // Invalidates query cache on DB changes
  return useQuery({
    queryKey: ['gallery'],
    queryFn: fetchGalleryImages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Infinite scroll pagination
export function useInfiniteGallery(category: string | null) {
  return useInfiniteQuery({
    queryKey: ['gallery-infinite', category],
    queryFn: ({ pageParam }) => fetchGalleryImagesInfinite({ pageParam, category }),
    getNextPageParam: (lastPage, allPages) => 
      lastPage.length === 12 ? allPages.length : undefined,
  });
}

// Similar images based on category/tags
export function useSimilarImages(image: GalleryImage | null) {
  return useQuery({
    queryKey: ['similar', image?.id],
    queryFn: () => getSimilarImages(image.id, image.category, image.tags),
    enabled: !!image,
  });
}
```

### `useCategories.ts`
```typescript
export function useCategories() {
  const [categories, setCategories] = useState<CategoryDB[]>([]);
  
  useEffect(() => {
    // Initial fetch
    fetchCategories();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('db-categories-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories' 
      }, () => fetchCategories())
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, []);
  
  return { categories, loading, error, refetch };
}
```

### `useFavorites.ts`
```typescript
export function useFavorites() {
  const { user } = useAuth();
  
  // Get favorite IDs for quick lookup
  const { data: favoriteIds } = useQuery({
    queryKey: ['favoriteIds', user?.uid],
    queryFn: () => getFavoriteIds(user.uid),
    enabled: !!user,
  });
  
  // Toggle favorite
  const toggleFavorite = (imageId: string) => {
    if (favoriteIds.includes(imageId)) {
      removeMutation.mutate(imageId);
    } else {
      addMutation.mutate(imageId);
    }
  };
  
  return { favorites, favoriteIds, toggleFavorite, isFavorited };
}
```

### `useSearch.ts`
```typescript
export function useSearch(images: GalleryImage[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') as Category;
  
  // Filter images based on query and category
  const filteredImages = useMemo(() => {
    return images.filter((image) => {
      if (selectedCategory && image.category !== selectedCategory) return false;
      if (query) {
        const matches = image.prompt.includes(query) || 
                       image.tags.some(t => t.includes(query));
        return matches;
      }
      return true;
    });
  }, [images, query, selectedCategory]);
  
  return { query, setQuery, selectedCategory, setSelectedCategory, filteredImages };
}
```

### `useIsMobile.ts`
```typescript
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}
```

### `useContentProtection.ts`
```typescript
export function useContentProtection() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // Disable text selection on images
    const handleSelectStart = (e: Event) => {
      if ((e.target as HTMLElement).closest('.gallery-image')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);
}
```

---

## ⚙️ الخدمات (Services)

### `gallery.service.ts`
```typescript
// Transform DB row to frontend type
export const transformImage = (dbImage: GalleryImageDB): GalleryImage => ({
  id: dbImage.id,
  url: dbImage.url,
  prompt: dbImage.prompt,
  category: dbImage.category as Category,
  tags: dbImage.tags,
  author: dbImage.author_name || 'Arti Studio',
  createdAt: dbImage.created_at,
  views: dbImage.views,
  copies: dbImage.copies,
  aspectRatio: dbImage.aspect_ratio,
});

// Fetch with pagination
export const fetchGalleryImagesInfinite = async ({ pageParam, category, limit }) => {
  let query = supabase.from('gallery_images').select('*')
    .order('created_at', { ascending: false })
    .range(pageParam * limit, (pageParam + 1) * limit - 1);
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data } = await query;
  return data.map(transformImage);
};

// Increment view/copy counts
export const incrementViews = async (imageId: string) => {
  await supabase.rpc('increment_views', { image_id: imageId });
};
```

### `favorites.service.ts`
```typescript
export const addFavorite = async (userId: string, imageId: string) => {
  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, image_id: imageId }]);
  return !error;
};

export const getUserFavorites = async (userId: string): Promise<GalleryImage[]> => {
  const { data } = await supabase
    .from('favorites')
    .select(`image_id, gallery_images (*)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return data.map(f => transformImage(f.gallery_images));
};
```

### `upload.service.ts`
```typescript
const WORKER_URL = 'https://r2-upload-worker.arti-studio.workers.dev';
const R2_PUBLIC_URL = 'https://pub-d1b86c05aa324c30b2a76b02f0d102ae.r2.dev';

// Upload via Cloudflare Worker
export const uploadImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${WORKER_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result.success ? `${R2_PUBLIC_URL}/${result.fileName}` : null;
};

// Validate file before upload
export const validateImageFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'حجم الملف كبير جداً' };
  }
  return { valid: true };
};
```

### `ai.service.ts`
```typescript
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent`;

export const generateSmartTags = async (
  prompt: string, 
  imageBase64?: string
): Promise<{ tags: string[], title: string }> => {
  const parts = [
    { text: systemPrompt },
    { text: `Prompt: ${prompt}` }
  ];
  
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }
  
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
    })
  });
  
  // Parse title and 4 tags from response
  return { title, tags };
};
```

### `recommendations.service.ts`
```typescript
interface UserInteraction {
  imageId: string;
  category: Category;
  tags: string[];
  action: 'view' | 'copy' | 'like';
  timestamp: number;
}

// Track user interactions in localStorage
export const trackInteraction = (image: GalleryImage, action: string) => {
  const interactions = getInteractions();
  interactions.push({
    imageId: image.id,
    category: image.category,
    tags: image.tags,
    action,
    timestamp: Date.now(),
  });
  localStorage.setItem('user_interactions', JSON.stringify(interactions.slice(-100)));
};

// Analyze preferences
export const analyzePreferences = () => {
  const interactions = getInteractions();
  // Weight actions: copy=3, like=2, view=1
  // Return top 3 categories and top 10 tags
};

// Get personalized recommendations
export const getRecommendations = async (allImages: GalleryImage[], limit = 12) => {
  const { favoriteCategories, favoriteTags } = analyzePreferences();
  
  return allImages
    .filter(img => !viewedIds.has(img.id))
    .map(img => {
      let score = 0;
      if (favoriteCategories.includes(img.category)) score += 10;
      score += img.tags.filter(t => favoriteTags.includes(t)).length * 5;
      score += Math.log(img.views + 1) * 2;
      return { image: img, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Trending images
export const getTrendingImages = (allImages: GalleryImage[], limit = 8) => {
  return allImages
    .map(img => {
      const daysSince = (Date.now() - new Date(img.createdAt).getTime()) / (1000*60*60*24);
      const recency = Math.max(0.5, 1 - daysSince / 30);
      return { image: img, score: (img.views + img.copies * 2) * recency };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
```

---

## 🏷 نظام الفئات

### Categories Configuration

الفئات معرّفة في **3 أماكن** (يُفضل التوحيد من الـ Database):

#### 1. `src/types/gallery.ts` - Types & Default Data
```typescript
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
  | 'vite';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'design', label: 'Design', labelAr: 'تصميم', icon: 'Palette', color: 'purple' },
  { id: 'architecture', label: 'Architecture', labelAr: 'عمارة', icon: 'Building2', color: 'blue' },
  // ... more
];
```

#### 2. `src/constants/categories.ts` - Styling Helpers
```typescript
// Gradients
export const CATEGORY_GRADIENTS: Record<string, string> = {
  design: 'from-violet-500 to-purple-600',
  architecture: 'from-blue-500 to-cyan-500',
  interior: 'from-amber-500 to-orange-500',
  // ...
};

// Icons mapping
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  design: Palette,
  architecture: Building2,
  // ...
};

// Shadow colors
export const CATEGORY_SHADOW_COLORS: Record<string, string> = {
  design: 'rgba(139, 92, 246, 0.4)',
  // ...
};

// Color name to gradient
export const COLOR_GRADIENTS: Record<string, string> = {
  purple: 'from-violet-500 to-purple-600',
  blue: 'from-blue-500 to-cyan-500',
  // ...
};

// Helper functions
export function getCategoryGradient(color: string): string;
export function getGradientShadow(gradient: string): string;
export function getCategoryColor(id: string): string;
```

#### 3. Database (`categories` table)
```javascript
// Fetched via useCategories() hook
{
  id: 'design',
  label: 'Design',
  label_ar: 'تصميم',
  icon: 'Palette',    // Lucide icon name
  color: 'purple',    // Maps to COLOR_GRADIENTS
  sort_order: 1
}
```

### Category Colors Table

| Category | Color | Gradient | Icon |
|----------|-------|----------|------|
| design | purple | violet-500 → purple-600 | Palette |
| architecture | blue | blue-500 → cyan-500 | Building2 |
| interior | amber | amber-500 → orange-500 | Sofa |
| fashion | pink | pink-500 → rose-500 | Shirt |
| art | red | red-500 → pink-500 | Brush |
| coding | green | emerald-500 → teal-500 | Code |
| lovable | rose | rose-500 → red-500 | Heart |
| bolt | yellow | yellow-400 → amber-500 | Zap |
| base44 | cyan | cyan-500 → blue-500 | Boxes |
| vite | orange | orange-500 → yellow-500 | Flame |

---

## 🧠 نظام التوصيات

### Recommendation Algorithm

```
┌────────────────────────────────────────────────────────┐
│                   USER INTERACTION                      │
│    (view, copy, like) → localStorage tracking          │
└────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│                 PREFERENCE ANALYSIS                     │
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │ Category Weights│  │ Tag Weights                  │ │
│  │ copy = 3x       │  │ Based on interaction history │ │
│  │ like = 2x       │  │ Top 10 tags                  │ │
│  │ view = 1x       │  └──────────────────────────────┘ │
│  └─────────────────┘                                   │
└────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│                    SCORING SYSTEM                       │
│  Score = CategoryMatch * 10                            │
│        + MatchingTags * 5                              │
│        + log(views) * 2                                │
│        + log(copies) * 3                               │
│        + RecencyBoost (7 days = +5, 30 days = +2)     │
└────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│              SIMILAR IMAGES ALGORITHM                   │
│  Score = SameCategory * 10                             │
│        + MatchingTags * 3                              │
│        + SameAuthor * 5                                │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 نظام المصادقة

### Auth Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         Firebase Auth                         │
│  ├── Email/Password                                          │
│  ├── Google OAuth                                            │
│  └── Email Verification                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      AuthContext.tsx                          │
│  ├── onAuthStateChanged listener                             │
│  ├── fetchOrCreateProfile() ──────► Supabase profiles        │
│  └── Provides: user, profile, isAdmin, signOut               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        Supabase                               │
│  profiles table                                               │
│  ├── id = Firebase UID (TEXT, not UUID!)                     │
│  ├── role = 'user' | 'admin'                                 │
│  └── Synced on first login                                   │
└──────────────────────────────────────────────────────────────┘
```

### Auth Context API
```typescript
interface AuthContextType {
  user: User | null;           // Firebase User
  profile: Profile | null;     // Supabase Profile
  loading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

---

## 🛡 لوحة التحكم (Admin)

### Admin Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin-mk-dashboard/login` | AdminLogin | Admin login page |
| `/admin-mk-dashboard` | AdminDashboard | Stats overview |
| `/admin-mk-dashboard/gallery` | GalleryManagement | Image CRUD |
| `/admin-mk-dashboard/categories` | CategoriesManagement | Category CRUD |
| `/admin-mk-dashboard/users` | UsersManagement | User management |
| `/admin-mk-dashboard/notifications` | NotificationsManagement | Notifications |
| `/admin-mk-dashboard/settings` | SettingsPage | Site settings |

### AdminLayout.tsx
- Sidebar navigation
- Sign out functionality
- Protected by `AdminProtectedRoute`

### GalleryManagement.tsx
```typescript
// Features:
// - Image upload via Cloudflare R2
// - AI-powered tag generation (Gemini)
// - CRUD operations
// - Category assignment
// - Drag & drop support
// - Image preview before upload
```

### CategoriesManagement.tsx
```typescript
// Features:
// - Add/Edit/Delete categories
// - Icon selection (Lucide icons)
// - Color picker
// - Sort order management
// - Realtime sync
```

---

## 📱 واجهة الموبايل

### Mobile Detection
```typescript
// useIsMobile.ts - breakpoint: 768px
const isMobile = window.innerWidth < 768;
```

### Mobile Components

| Component | Purpose |
|-----------|---------|
| **MobileHeader** | Top bar with menu button |
| **BottomNav** | 5-tab navigation (Explore, Search, Gallery, Saved, Profile) |
| **MobileMenu** | Side drawer with categories |
| **MobileImageModal** | Optimized image view for touch |
| **MobileSearchModal** | Full-screen search |

### BottomNav Structure
```typescript
const NAV_ITEMS = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'search', label: 'Search', icon: Search, isSearch: true },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'favorites', label: 'Saved', icon: Heart, requiresAuth: true },
  { id: 'profile', label: 'Profile', icon: User },
];
```

### Mobile-specific CSS
```css
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## 🎨 نظام التصميم

### Design Tokens (CSS Variables)
```css
:root {
  /* Background */
  --background: 220 20% 6%;        /* Dark slate */
  --foreground: 210 20% 95%;
  
  /* Primary (Purple) */
  --primary: 270 60% 60%;
  --primary-foreground: 210 40% 98%;
  
  /* Secondary */
  --secondary: 220 20% 14%;
  
  /* Accent (Teal) */
  --accent: 170 50% 45%;
  
  /* Glass Effect */
  --glass-bg: 220 20% 8%;
  --glass-border: 220 15% 22%;
  
  /* Gradients */
  --gradient-purple: 270 60% 50%;
  --gradient-teal: 170 50% 40%;
}
```

### Glassmorphism
```css
.glass {
  backdrop-filter: blur(16px);
  background: linear-gradient(135deg,
    hsl(var(--glass-bg) / 0.85) 0%,
    hsl(var(--glass-bg) / 0.7) 100%);
  border-color: hsl(var(--glass-border) / 0.5);
}

.glass-gradient-underlay::before {
  background: linear-gradient(180deg,
    hsl(var(--gradient-purple) / 0.08) 0%,
    hsl(var(--gradient-teal) / 0.05) 50%,
    transparent 100%);
}
```

### Content Protection
```css
.no-select {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
.no-drag {
  -webkit-user-drag: none;
  user-drag: none;
}
```

### Typography
```css
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 🛣 الـ Routes

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Index | Home/Gallery page |
| `/trends` | TrendsPage | Trending images |
| `/favorites` | FavoritesPage | User favorites (Auth) |
| `/profile` | ProfilePage | User profile (Auth) |
| `/login` | LoginPage | Login form |
| `/register` | RegisterPage | Registration form |
| `/auth/callback` | AuthCallback | OAuth callback |
| `*` | NotFound | 404 page |

### Admin Routes
| Path | Protected | Component |
|------|-----------|-----------|
| `/admin-mk-dashboard/login` | ❌ | AdminLogin |
| `/admin-mk-dashboard` | ✅ | AdminDashboard |
| `/admin-mk-dashboard/users` | ✅ | UsersManagement |
| `/admin-mk-dashboard/gallery` | ✅ | GalleryManagement |
| `/admin-mk-dashboard/categories` | ✅ | CategoriesManagement |
| `/admin-mk-dashboard/notifications` | ✅ | NotificationsManagement |
| `/admin-mk-dashboard/settings` | ✅ | SettingsPage |

### URL Parameters
```typescript
// Search & Filter
/?q=searchQuery              // Text search
/?category=design            // Category filter
/?q=art&category=design      // Combined

// Deep link to image
/?imageId=uuid-here          // Opens image modal directly
```

---

## 🔗 التكاملات الخارجية

### Firebase Configuration
```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyCoGhUm6ASdWLwXhI2oUd2egGOlGLNzVAc",
  authDomain: "arti-studio.firebaseapp.com",
  projectId: "arti-studio",
  storageBucket: "arti-studio.firebasestorage.app",
  messagingSenderId: "1099249852498",
  appId: "1:1099249852498:web:47ebbb66013b5d2768bf8b",
  measurementId: "G-WGXX9N6HK2"
};
```

### Supabase Configuration
```typescript
// src/lib/supabase.ts
const supabaseUrl = 'https://vzufxxzsktuvvsjtjgai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIs...';
```

### Cloudflare R2
```typescript
// Worker URL
const WORKER_URL = 'https://r2-upload-worker.arti-studio.workers.dev';
// Public bucket URL
const R2_PUBLIC_URL = 'https://pub-d1b86c05aa324c30b2a76b02f0d102ae.r2.dev';
```

### Gemini AI
```typescript
// API Key from env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Model
const GEMINI_MODEL = 'gemini-flash-lite-latest';
```

---

## ⚠️ ملاحظات تقنية

### 🔴 ملاحظات هامة

1. **Category Duplication**
   - الفئات معرّفة في 3 أماكن مختلفة
   - يُفضل الاعتماد على الـ Database فقط
   - الـ constants تستخدم كـ fallback

2. **Firebase UID vs UUID**
   - Firebase يستخدم string UIDs
   - Supabase profiles.id يجب أن يكون TEXT وليس UUID
   - راجع `supabase-schema.sql` للتفاصيل

3. **Lazy Loading**
   - جميع الصفحات محملة كـ lazy components
   - الـ Modals أيضاً lazy loaded

4. **Realtime Subscriptions**
   - Channel names: `db-gallery-changes`, `db-categories-changes`
   - Remember to cleanup على unmount

5. **Content Protection**
   - ليست 100% آمنة لكن تقلل النسخ غير المرغوب
   - Right-click disabled, text selection disabled

### 🟡 تحسينات مقترحة

1. **PWA Support** - مذكور في الخطة لكن غير مُنفذ
2. **Service Workers** - للـ Offline support
3. **Image Optimization** - WebP conversion
4. **SEO** - Dynamic sitemap needed
5. **Analytics** - Firebase Analytics setup incomplete

### 🟢 أفضل الممارسات المُتبعة

1. ✅ React Query للـ caching
2. ✅ Realtime subscriptions
3. ✅ Responsive design
4. ✅ TypeScript strict mode
5. ✅ Component-based architecture
6. ✅ Separation of concerns (hooks, services, components)

---

## 📄 خريطة الملفات

### Components (72 files)

```
src/components/
├── NavLink.tsx
├── auth/
│   ├── AuthCallback.tsx
│   ├── AuthContext.tsx
│   ├── AuthLayout.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── index.ts
├── gallery/
│   ├── GalleryGrid.tsx
│   ├── GalleryItem.tsx
│   ├── GallerySkeleton.tsx
│   └── ImageModal.tsx
├── layout/
│   ├── AppLayout.tsx
│   ├── Header.tsx
│   ├── MainLayout.tsx
│   └── Sidebar.tsx
├── mobile/
│   ├── BottomNav.tsx
│   ├── MobileHeader.tsx
│   ├── MobileImageModal.tsx
│   ├── MobileMenu.tsx
│   └── MobileSearchModal.tsx
├── search/
│   ├── SearchBar.tsx
│   └── SearchModal.tsx
└── ui/                    # 50 shadcn/ui components
    ├── accordion.tsx
    ├── alert-dialog.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── select.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── toast.tsx
    └── ... (37 more)
```

### Pages (14 files)

```
src/pages/
├── Index.tsx
├── FavoritesPage.tsx
├── TrendsPage.tsx
├── ProfilePage.tsx
├── NotFound.tsx
└── admin/
    ├── AdminDashboard.tsx
    ├── AdminLayout.tsx
    ├── AdminLogin.tsx
    ├── index.ts
    ├── categories/
    │   └── CategoriesManagement.tsx
    ├── gallery/
    │   └── GalleryManagement.tsx
    ├── notifications/
    │   └── NotificationsManagement.tsx
    ├── settings/
    │   └── SettingsPage.tsx
    └── users/
        └── UsersManagement.tsx
```

### Hooks (8 files)

```
src/hooks/
├── useGallery.ts          # Gallery data + realtime
├── useCategories.ts       # Categories + realtime
├── useFavorites.ts        # User favorites
├── useSearch.ts           # Search + URL params
├── useIsMobile.ts         # Mobile detection
├── useContentProtection.ts # Content protection
├── use-toast.ts           # Toast notifications
└── use-mobile.tsx         # Mobile hook (shadcn)
```

### Services (5 files)

```
src/services/
├── gallery.service.ts        # Gallery CRUD
├── favorites.service.ts      # Favorites CRUD
├── upload.service.ts         # R2 image upload
├── recommendations.service.ts # Smart recommendations
└── ai.service.ts             # Gemini AI tags
```

### Types (2 files)

```
src/types/
├── gallery.ts              # GalleryImage, Category, etc.
└── database.types.ts       # Supabase schema types
```

### Constants (2 files)

```
src/constants/
├── categories.ts           # Gradients, icons, colors
└── navigation.ts           # NAV_ITEMS, LIBRARY_ITEMS
```

### Lib (3 files)

```
src/lib/
├── supabase.ts             # Supabase client
├── firebase.ts             # Firebase auth
└── utils.ts                # cn() utility
```

---

## 📊 إحصائيات المشروع

| Metric | Value |
|--------|-------|
| **Total Files** | ~110 TypeScript/TSX |
| **Components** | 72 |
| **Pages** | 14 |
| **Hooks** | 8 |
| **Services** | 5 |
| **UI Components (shadcn)** | 50 |
| **Lines of CSS** | ~277 |
| **Dependencies** | 55 |
| **Dev Dependencies** | 18 |

---

## 🚀 الأوامر المتاحة

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build (includes sitemap)
npm run build:dev        # Development build

# Other
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run generate:sitemap # Generate sitemap only
```

---

> **Last Updated:** 2025-12-25 by Claude AI
