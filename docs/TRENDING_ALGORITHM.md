# 🔥 Arti Studio Advanced Trending Algorithm

## Overview

This document explains the advanced trending algorithm implemented for Arti Studio, inspired by world-class platforms like **Reddit**, **Hacker News**, **YouTube**, and **TikTok**.

## 🎯 Design Philosophy

### Problem with Simple "Most Views" Approach
- Old images with high views always dominate
- New viral content can't break through
- No consideration for engagement quality

### Our Solution: Multi-Factor Pre-Computed Scoring
- **Wilson Score** (Reddit) - Handles small sample sizes fairly
- **Time Decay** (Hacker News) - Fresh content gets visibility
- **Velocity Score** (TikTok) - Fast engagement is rewarded
- **Engagement Weighting** (YouTube) - Quality interactions matter more

## 📊 Algorithm Components

### 1. Wilson Score (15% weight)
```
Used by Reddit for comment ranking.
Provides statistical confidence interval for "true" quality.
Prevents items with very few interactions from ranking too high.
```

### 2. Engagement Score (30% weight)
```
Weighted sum of interactions:
- Views: 1x weight
- Copies: 5x weight (high intent action)
- Favorites: 3x weight (shows interest)

Logarithmically normalized to prevent extreme scores.
```

### 3. Velocity Score (35% weight) ⭐ Most Important
```
Measures how fast content gains engagement relative to its age.
Formula: ln(recent_engagement + 1) * 10 * (1 + recency_weight)

High velocity = content is going viral NOW
This is what TikTok uses to surface new creators.
```

### 4. Recency Score (20% weight)
```
Hacker News style gravity-based decay.
Formula: 100 / (age_hours + 2)^1.5

Bonuses:
- < 6 hours: +30 points
- < 24 hours: +20 points
- < 72 hours: +10 points
- < 1 week: +5 points
```

## ⚡ Performance Optimization

### Pre-Computed Caching Strategy
Instead of calculating trending scores on every request (expensive), we:

1. **Store pre-computed scores** in `trending_cache` table
2. **Update periodically** (every 15-30 minutes)
3. **Single simple SELECT** for retrieval

### Database Calls Comparison

| Approach | Calls per Request | Computation |
|----------|------------------|-------------|
| Old (simple) | 1 query + sort | O(n log n) |
| Naive advanced | 4+ queries + joins | O(n²) |
| **Our approach** | 1 simple SELECT | O(1) |

### Cache Update Process
```sql
-- Run every 15-30 minutes (via cron or admin trigger)
SELECT update_trending_cache();

-- Returns:
{
  "success": true,
  "images_processed": 1234,
  "execution_ms": 250
}
```

## 🚀 Usage

### 1. Initial Setup (Run Once in Supabase SQL Editor)
```sql
-- Run the entire trending-algorithm.sql file
-- Then populate the cache:
SELECT update_trending_cache();
```

### 2. Get Trending Images (Frontend)
```typescript
import { getTrendingImages } from '@/services/recommendations.service';

// Get top 50 trending
const trending = await getTrendingImages(50);

// Get by category
const designTrending = await getTrendingImages(20, 0, 'design');
```

### 3. Refresh Cache (Admin Dashboard)
```typescript
import { refreshTrendingCache, getTrendingStats } from '@/services/recommendations.service';

// Refresh the cache
const result = await refreshTrendingCache();
console.log(`Processed ${result.imagesProcessed} images in ${result.executionMs}ms`);

// Get stats
const stats = await getTrendingStats();
console.log(stats);
// {
//   total_images: 1234,
//   last_updated: "2024-12-30T19:15:00Z",
//   avg_trending_score: 45.67,
//   fresh_content_count: 89,
//   ...
// }
```

### 4. Direct SQL Query (Fastest)
```sql
-- Simple ranked retrieval
SELECT gi.*, tc.trending_score, tc.rank
FROM trending_cache tc
JOIN gallery_images gi ON gi.id = tc.image_id
ORDER BY tc.rank
LIMIT 50;
```

## 🔄 Automatic Updates

### Option 1: Supabase pg_cron (Recommended)
```sql
-- Enable pg_cron extension in Supabase
SELECT cron.schedule(
  'update-trending',
  '*/15 * * * *',  -- Every 15 minutes
  'SELECT update_trending_cache()'
);
```

### Option 2: External Cron (Cloudflare Worker)
```typescript
// worker.ts
export default {
  async scheduled(event, env, ctx) {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/update_trending_cache`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
  }
};
```

### Option 3: Manual (Admin Button)
Add a button in admin dashboard that calls `refreshTrendingCache()`.

## 📈 Tuning Parameters

### Weight Distribution
Adjust in `calculate_trending_score()` function:
```sql
engagement_weight := 0.30;  -- 30%
velocity_weight := 0.35;    -- 35% (most important)
recency_weight := 0.20;     -- 20%
wilson_weight := 0.15;      -- 15%
```

### Gravity (Time Decay Speed)
Adjust in `recency_score()` function:
```sql
gravity := 1.5  -- Lower = slower decay, Higher = faster decay
-- Hacker News uses 1.8
-- We use 1.5 for slightly longer visibility
```

### Engagement Weights
Adjust in `engagement_score()` function:
```sql
view_weight := 1;
copy_weight := 5;      -- Copies are high intent
favorite_weight := 3;  -- Favorites show interest
```

## 🧪 Testing

### Verify Algorithm is Working
```sql
-- Check top trending with scores
SELECT 
  gi.prompt,
  tc.trending_score,
  tc.velocity_score,
  tc.engagement_score,
  tc.recency_score,
  tc.rank,
  tc.age_hours
FROM trending_cache tc
JOIN gallery_images gi ON gi.id = tc.image_id
ORDER BY tc.rank
LIMIT 10;
```

### Verify Fresh Content Gets Boosted
```sql
-- Fresh images should have high recency_score
SELECT 
  gi.prompt,
  tc.age_hours,
  tc.recency_score,
  tc.rank
FROM trending_cache tc
JOIN gallery_images gi ON gi.id = tc.image_id
WHERE tc.age_hours < 24
ORDER BY tc.recency_score DESC
LIMIT 10;
```

## 🎉 Result

With this implementation:
- ✅ **New content gets a fair chance** (recency boost)
- ✅ **Viral content surfaces fast** (velocity score)
- ✅ **Quality engagement matters** (weighted scoring)
- ✅ **Statistical fairness** (Wilson score)
- ✅ **Minimal database load** (pre-computed cache)
- ✅ **Blazing fast retrieval** (simple SELECT)

---

Created: 2024-12-30
Algorithm Version: 2.0
