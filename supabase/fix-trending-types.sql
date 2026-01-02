-- =============================================
-- FIX: Update functions to accept BIGINT
-- Run this to fix type mismatch errors
-- =============================================

-- Drop and recreate functions with BIGINT support

-- 1. WILSON SCORE (accepts BIGINT) - FIXED for edge cases
CREATE OR REPLACE FUNCTION wilson_score(positive BIGINT, total BIGINT)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    n DECIMAL;
    p_hat DECIMAL;
    z DECIMAL := 1.96;
    denominator DECIMAL;
    sqrt_value DECIMAL;
    lower_bound DECIMAL;
BEGIN
    -- Handle edge cases
    IF total IS NULL OR total <= 0 THEN
        RETURN 0;
    END IF;
    
    -- If positive > total, cap it (data inconsistency)
    IF positive > total THEN
        positive := total;
    END IF;
    
    -- If no positive signals, return 0
    IF positive IS NULL OR positive <= 0 THEN
        RETURN 0;
    END IF;
    
    n := total::DECIMAL;
    p_hat := positive::DECIMAL / n;
    
    -- Clamp p_hat between 0 and 1
    p_hat := LEAST(1.0, GREATEST(0.0, p_hat));
    
    denominator := 1 + (z * z / n);
    
    -- Calculate the value inside sqrt, ensure it's not negative
    sqrt_value := (p_hat * (1 - p_hat) + z * z / (4 * n)) / n;
    sqrt_value := GREATEST(0, sqrt_value);
    
    lower_bound := (
        p_hat + (z * z / (2 * n)) - z * SQRT(sqrt_value)
    ) / denominator;
    
    RETURN GREATEST(0, lower_bound * 100);
END;
$$;

-- 2. VELOCITY SCORE (accepts BIGINT)
CREATE OR REPLACE FUNCTION velocity_score(
    total_engagement BIGINT,
    recent_engagement BIGINT,
    age_hours DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    velocity DECIMAL;
    recency_weight DECIMAL;
BEGIN
    IF age_hours < 1 THEN
        age_hours := 1;
    END IF;
    
    velocity := recent_engagement::DECIMAL / age_hours;
    velocity := LN(velocity + 1) * 10;
    
    IF total_engagement > 0 THEN
        recency_weight := recent_engagement::DECIMAL / total_engagement::DECIMAL;
        velocity := velocity * (1 + recency_weight);
    END IF;
    
    RETURN LEAST(100, GREATEST(0, velocity));
END;
$$;

-- 3. ENGAGEMENT SCORE (accepts BIGINT)
CREATE OR REPLACE FUNCTION engagement_score(
    views BIGINT,
    copies BIGINT,
    favorites BIGINT
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    view_weight DECIMAL := 1;
    copy_weight DECIMAL := 5;
    favorite_weight DECIMAL := 3;
    
    raw_score DECIMAL;
    normalized_score DECIMAL;
BEGIN
    raw_score := (COALESCE(views, 0) * view_weight) + 
                 (COALESCE(copies, 0) * copy_weight) + 
                 (COALESCE(favorites, 0) * favorite_weight);
    
    normalized_score := LN(raw_score + 1) * 10;
    
    RETURN LEAST(100, GREATEST(0, normalized_score));
END;
$$;

-- 4. RECENCY SCORE (no change needed, already uses DECIMAL)

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

-- =============================================
-- Now try updating the cache again
-- =============================================
SELECT update_trending_cache();
