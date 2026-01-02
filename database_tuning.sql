-- PERFORMANCE TUNING: INDEXES
-- Adds critical indexes to support the new RLS policies and common filter queries.

-- 1. Support for RLS & Joins (CRITICAL)
-- Because every RLS policy checks 'author_id', this index provides massive speedups.
CREATE INDEX IF NOT EXISTS idx_gallery_author_id ON gallery_images(author_id);

-- 2. Support for Sorting (Feed & Trends)
-- Speeds up "ORDER BY created_at DESC" and "ORDER BY views DESC"
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_views ON gallery_images(views DESC);

-- 3. Support for Category Filtering
-- Speeds up "WHERE category = 'nature'"
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);

-- 4. Support for Tag Search (GIN Index)
-- Speeds up "tags @> {input}" queries which are usually very slow without GIN.
CREATE INDEX IF NOT EXISTS idx_gallery_tags ON gallery_images USING GIN (tags);

-- 5. Support for Profile Search
-- Speeds up user search in Admin panel
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 6. Support for Favorites
-- Speeds up "Get My Favorites"
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_image_id ON favorites(image_id);
