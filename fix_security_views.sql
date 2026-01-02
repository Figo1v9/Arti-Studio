-- =============================================
-- FIX SECURITY DEFINER VIEWS
-- Resolves Supabase Linter Errors: "Security Definer View"
-- =============================================

-- 1. Fix slow_queries_live
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

-- 2. Fix index_usage_stats
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

-- 3. Fix table_stats
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

-- 4. Fix connection_stats
CREATE OR REPLACE VIEW connection_stats WITH (security_invoker = true) AS
SELECT 
    state,
    count(*) AS count,
    max(now() - state_change) AS max_duration
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
