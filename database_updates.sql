-- Database Optimization & Security Updates
-- Run this in your Supabase SQL Editor

-- 1. Create RPC function for batched view increments
-- This fixes the N+1 update problem and race conditions
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
    where id = (item->>'id')::uuid;
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
    where id = (item->>'id')::uuid;
  end loop;
end;
$$;

-- 3. Enable Row Level Security (RLS) on Gallery Images
alter table gallery_images enable row level security;

-- 4. Policy: Public can view verified public images
create policy "Public images are visible to everyone"
on gallery_images for select
using (
  exists (
    select 1 from profiles
    where profiles.id = gallery_images.author_id
    and profiles.is_public = true
  )
);

-- 5. Policy: Users can see their own images (even private ones)
create policy "Users can see own images"
on gallery_images for select
using (
  auth.uid() = author_id
);

-- 6. Policy: Admins can see everything (Requires admin check function)
-- Assuming you have an is_admin() function or similar:
-- create policy "Admins see all" on gallery_images for select using ( is_admin() );
