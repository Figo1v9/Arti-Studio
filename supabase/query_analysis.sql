-- =============================================
-- QUERY PERFORMANCE ANALYSIS & EXPLAIN PLANS
-- Run these in Supabase SQL Editor to verify index usage
-- 
-- NOTE: Replace the example IDs below with real IDs from your database
-- You can get a sample user_id with: SELECT id FROM profiles LIMIT 1;
-- You can get a sample image_id with: SELECT id FROM gallery_images LIMIT 1;
-- =============================================

-- =============================================
-- 1. FEED QUERY - Most common query
-- Expected: Index Scan on idx_gallery_images_category_created
-- =============================================
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM gallery_images 
WHERE category = 'design'
ORDER BY created_at DESC 
LIMIT 30;

-- =============================================
-- 2. TRENDING QUERY - From cache table
-- Expected: Index Scan on idx_trending_cache_rank
-- =============================================
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT tc.*, gi.url, gi.prompt 
FROM trending_cache tc
JOIN gallery_images gi ON gi.id = tc.image_id
ORDER BY tc.rank ASC
LIMIT 50;

-- =============================================
-- 3. USER PROFILE IMAGES
-- Replace with a real user ID from your profiles table
-- Expected: Index Scan on idx_gallery_images_author_created
-- =============================================
-- Get a sample user id first:
-- SELECT id FROM profiles LIMIT 1;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM gallery_images 
WHERE author_id = (SELECT id FROM profiles LIMIT 1)
ORDER BY created_at DESC 
LIMIT 20;

-- =============================================
-- 4. FOLLOWERS QUERY (Optimized with JOIN)
-- Expected: Index Scan on idx_follows_following + Single Join
-- =============================================
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT p.id, p.username, p.avatar_url 
FROM follows f
JOIN profiles p ON p.id = f.follower_id
WHERE f.following_id = (SELECT id FROM profiles LIMIT 1);

-- =============================================
-- 5. FAVORITES CHECK
-- Expected: Index Only Scan on idx_favorites_user_image
-- =============================================
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT 1 FROM favorites 
WHERE user_id = (SELECT id FROM profiles LIMIT 1) 
  AND image_id = (SELECT id FROM gallery_images LIMIT 1)
LIMIT 1;

-- =============================================
-- 6. SEARCH QUERY (Text + Tags)
-- Expected: Bitmap Index Scan on idx_gallery_images_tags (GIN)
-- =============================================
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM gallery_images 
WHERE prompt ILIKE '%design%' OR tags @> ARRAY['design']
ORDER BY created_at DESC 
LIMIT 20;

-- =============================================
-- SLOW QUERY LOG SETUP
-- NOTE: In Supabase, you cannot set log_min_duration_statement via SQL
-- Instead, go to: Dashboard → Database → Settings → Slow Query Log
-- Or contact Supabase support for enterprise plans
-- =============================================

-- =============================================
-- VIEWS FOR MONITORING
-- =============================================

-- View: Current slow queries
CREATE OR REPLACE VIEW slow_queries_live WITH (security_invoker = true) AS
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '1 second'
  AND state != 'idle'
ORDER BY duration DESC;

-- View: Index usage statistics
CREATE OR REPLACE VIEW index_usage_stats WITH (security_invoker = true) AS
SELECT 
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS times_used,
    idx_tup_read AS rows_read,
    idx_tup_fetch AS rows_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- View: Table statistics
CREATE OR REPLACE VIEW table_stats WITH (security_invoker = true) AS
SELECT 
    relname AS table_name,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =============================================
-- CONNECTION POOL MONITORING
-- =============================================

-- View: Current connections by state
CREATE OR REPLACE VIEW connection_stats WITH (security_invoker = true) AS
SELECT 
    state,
    count(*) AS count,
    max(now() - state_change) AS max_duration
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;

-- Check max connections
SELECT current_setting('max_connections') AS max_connections;

-- =============================================
-- USEFUL DIAGNOSTIC QUERIES
-- =============================================

-- Top 10 largest tables
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- Cache hit ratio (should be > 99%)
SELECT 
    'index hit rate' AS name,
    (sum(idx_blks_hit)) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100 AS ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT 
    'table hit rate' AS name,
    sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 AS ratio
FROM pg_statio_user_tables;
