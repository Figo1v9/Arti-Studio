-- Enable the pgvector extension to work with embeddings
create extension if not exists vector with schema extensions;

-- Add embedding column to gallery_images (for semantic image search)
-- We use 768 dimensions which is standard for 'bge-base-en-v1.5' model
alter table gallery_images 
add column if not exists embedding vector(768);

-- Add embedding column to profiles (for semantic creator search)
alter table profiles 
add column if not exists embedding vector(768);

-- Create HNSW indexes for very fast approximate nearest neighbor search
create index if not exists gallery_images_embedding_idx 
on gallery_images using hnsw (embedding vector_cosine_ops);

create index if not exists profiles_embedding_idx 
on profiles using hnsw (embedding vector_cosine_ops);

-- Function to search both images and creators simultaneously
-- MINIMAL RPC: Returns just IDs and similarity scores. Frontend handles full data hydration.
create or replace function hybrid_search(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns json
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  image_results json;
  profile_results json;
begin
  -- Search Images (Minimal: ID + Similarity only)
  select json_agg(imgs) into image_results from (
    select
      i.id,
      1 - (i.embedding <=> query_embedding) as similarity
    from gallery_images i
    where i.embedding is not null 
      and 1 - (i.embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count
  ) imgs;

  -- Search Profiles (Minimal)
  select json_agg(profs) into profile_results from (
    select
      id,
      username,
      full_name,
      avatar_url,
      1 - (embedding <=> query_embedding) as similarity
    from profiles
    where embedding is not null
      and 1 - (embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit 5
  ) profs;

  return json_build_object(
    'images', coalesce(image_results, '[]'::json),
    'profiles', coalesce(profile_results, '[]'::json)
  );
end;    
$$;
