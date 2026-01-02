-- FIXED Database Optimization & Security Updates
-- Run this in your Supabase SQL Editor

-- 1. Create RPC function for batched view increments
-- FIXED: Cast ID correctly based on your schema. Assuming 'id' is standard UUID.
-- If you get an error here, your 'id' column might be TEXT.
create or replace function increment_views_batch(payload jsonb)
returns void
language plpgsql
security definer
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(payload)
  loop
    update gallery_images
    set views = views + (item->>'count')::int
    where id::text = (item->>'id'); -- Safe comparison (Text to Text)
  end loop;
end;
$$;

-- 2. Create RPC function for batched copy increments
create or replace function increment_copies_batch(payload jsonb)
returns void
language plpgsql
security definer
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(payload)
  loop
    update gallery_images
    set copies = copies + (item->>'count')::int
    where id::text = (item->>'id'); -- Safe comparison
  end loop;
end;
$$;

-- 3. Enable Row Level Security (RLS) on Gallery Images
alter table gallery_images enable row level security;

-- 4. Policy: Public can view verified public images
-- Drop if exists to avoid conflict
drop policy if exists "Public images are visible to everyone" on gallery_images;
create policy "Public images are visible to everyone"
on gallery_images for select
using (
  exists (
    select 1 from profiles
    where profiles.id::text = gallery_images.author_id -- Cast profile UUID to text for comparison
    and profiles.is_public = true
  )
);

-- 5. Policy: Users can see their own images (even private ones)
-- Drop if exists
drop policy if exists "Users can see own images" on gallery_images;
create policy "Users can see own images"
on gallery_images for select
using (
  auth.uid()::text = author_id -- FIXED: Start casting UUID to Text to match Firebase IDs
);

-- 6. Optional: Allow users to insert their own images
drop policy if exists "Users can upload own images" on gallery_images;
create policy "Users can upload own images"
on gallery_images for insert
with check (
  auth.uid()::text = author_id
);

-- 7. Optional: Allow users to update their own images
drop policy if exists "Users can update own images" on gallery_images;
create policy "Users can update own images"
on gallery_images for update
using (
  auth.uid()::text = author_id
);

-- 8. Optional: Allow users to delete their own images
drop policy if exists "Users can delete own images" on gallery_images;
create policy "Users can delete own images"
on gallery_images for delete
using (
  auth.uid()::text = author_id
);
