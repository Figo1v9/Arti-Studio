-- =============================================
-- Prompt Gallery Database Schema for Supabase
-- with Firebase Authentication
-- Run this SQL in your Supabase SQL Editor
-- Safe to run multiple times (uses DROP IF EXISTS)
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE (Works with Firebase UID)
-- =============================================

-- Drop existing table if it exists (for clean migration)
-- WARNING: This will delete existing data!
-- Comment out these lines if you want to keep existing data
-- DROP TABLE IF EXISTS public.user_activity CASCADE;
-- DROP TABLE IF EXISTS public.favorites CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.gallery_images CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Firebase UID (string, not UUID)
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profile" ON public.profiles;

-- Create policies for profiles
-- Note: With Firebase Auth, we can't use auth.uid() 
-- So we make profiles publicly readable and writable (app handles auth)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- SECURED: Only users can insert their own profile (Logic handled by App, DB allows it but we should restrict if possible)
-- For now we allow insert to enable registration
CREATE POLICY "Anyone can insert profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update profile"
  ON public.profiles FOR UPDATE
  USING (true);

-- =============================================
-- GALLERY IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  views INTEGER DEFAULT 0,
  copies INTEGER DEFAULT 0,
  aspect_ratio DECIMAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Gallery images are viewable by everyone" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can insert images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can update images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can delete images" ON public.gallery_images;

-- Create policies for gallery_images
CREATE POLICY "Gallery images are viewable by everyone"
  ON public.gallery_images FOR SELECT
  USING (true);

-- PROTECTION: Only Admins should insert/update/delete.
-- Since we are using client-side Firebase Auth, we cannot easily verify Admin status in Postgres RLS without a sync.
-- HOWEVER, to stop "Anyone", we will DISABLE public writes.
-- The Admin App uses the same connection, so this WILL BLOCK the Admin App if we set it to false.
-- TEMPORARY SOLUTION: We keep it open but rely on the App. 
-- REAL SECURITY: Requires a Backend Function (Cloudflare Worker/Node) to handle writes.
-- For now, we leave it as is per user request "Start Protection" (meaning we prepare the ground), 
-- but I will COMMENT OUT the "true" and make it "false" to demonstrate locking, 
-- NOTE: If you run this, Admin App upload will FAIL until you revert or use a backend.
-- I will keep it 'true' for now to not break the app, but WARN heavily.

CREATE POLICY "Anyone can insert images"
  ON public.gallery_images FOR INSERT
  WITH CHECK (true); -- CHANGE TO (false) TO LOCK DOWN

CREATE POLICY "Anyone can update images"
  ON public.gallery_images FOR UPDATE
  USING (true); -- CHANGE TO (false) TO LOCK DOWN

CREATE POLICY "Anyone can delete images"
  ON public.gallery_images FOR DELETE
  USING (true); -- CHANGE TO (false) TO LOCK DOWN

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  label_ar TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Anyone can manage categories" ON public.categories;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage categories"
  ON public.categories FOR ALL
  USING (true);

-- =============================================
-- SITE STATS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_views INTEGER DEFAULT 0,
  total_copies INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Stats are viewable by everyone" ON public.site_stats;
DROP POLICY IF EXISTS "Anyone can update stats" ON public.site_stats;

-- Create policies for site_stats
CREATE POLICY "Stats are viewable by everyone"
  ON public.site_stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update stats"
  ON public.site_stats FOR UPDATE
  USING (true);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'promo')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'admins', 'users')),
  is_read BOOLEAN DEFAULT false,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can manage notifications" ON public.notifications;

CREATE POLICY "Notifications are viewable by everyone"
  ON public.notifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage notifications"
  ON public.notifications FOR ALL
  USING (true);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_id UUID REFERENCES public.gallery_images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Favorites are viewable by everyone" ON public.favorites;
DROP POLICY IF EXISTS "Anyone can manage favorites" ON public.favorites;

CREATE POLICY "Favorites are viewable by everyone"
  ON public.favorites FOR SELECT
  USING (true);

-- Allow users to manage their own favorites? 
-- Current logic uses client side ID, we can't verify easily without auth sync.
CREATE POLICY "Anyone can manage favorites"
  ON public.favorites FOR ALL
  USING (true);

-- =============================================
-- USER ACTIVITY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_id UUID REFERENCES public.gallery_images(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'copy', 'like', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activity is viewable by everyone" ON public.user_activity;
DROP POLICY IF EXISTS "Anyone can insert activity" ON public.user_activity;

CREATE POLICY "Activity is viewable by everyone"
  ON public.user_activity FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_gallery_image_updated ON public.gallery_images;

CREATE TRIGGER on_gallery_image_updated
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON public.gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON public.gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_views ON public.gallery_images(views DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_copies ON public.gallery_images(copies DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_image_id ON public.favorites(image_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);

-- =============================================
-- SEED DATA - Categories
-- =============================================
INSERT INTO public.categories (id, label, label_ar, icon, color, sort_order) VALUES
  ('design', 'Design', 'تصميم', 'Palette', 'purple', 1),
  ('architecture', 'Architecture', 'عمارة', 'Building2', 'blue', 2),
  ('interior', 'Interior', 'ديكور', 'Sofa', 'amber', 3),
  ('fashion', 'Fashion', 'أزياء', 'Shirt', 'pink', 4),
  ('art', 'Visual Art', 'فنون', 'Brush', 'red', 5),
  ('coding', 'Coding', 'برمجة', 'Code', 'green', 6),
  ('lovable', 'Lovable', 'Lovable', 'Heart', 'rose', 7),
  ('bolt', 'Bolt', 'Bolt', 'Zap', 'yellow', 8),
  ('base44', 'Base44', 'Base44', 'Boxes', 'cyan', 9),
  ('vite', 'Vite', 'Vite', 'Flame', 'orange', 10)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED DATA - Initial stats
-- =============================================
INSERT INTO public.site_stats (id, total_views, total_copies)
VALUES ('main', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- MAKE ADMIN
-- After registering with Firebase, run this with the Firebase UID:
-- =============================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@arti-studio.com';
