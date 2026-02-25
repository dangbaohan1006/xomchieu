-- Enable pgvector extension
create extension if not exists vector;

-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Create watch_progress table
create table if not exists public.watch_progress (
  user_id uuid references auth.users not null,
  media_id text not null,
  media_type text not null,
  progress float8 not null default 0,
  last_watched_at timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb,
  primary key (user_id, media_id)
);

-- Enable RLS for watch_progress
alter table public.watch_progress enable row level security;

create policy "Users can update their own watch progress"
  on public.watch_progress for upsert
  with check (auth.uid() = user_id);

create policy "Users can view their own watch progress"
  on public.watch_progress for select
  using (auth.uid() = user_id);

-- Create table for media embeddings (Vector Search)
create table if not exists public.media_embeddings (
  id uuid primary key default gen_random_uuid(),
  media_id text unique not null,
  title text not null,
  description text,
  embedding vector(1536), -- Assuming OpenAI embeddings, adjust as needed
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create HNSW index for KNN search
create index on public.media_embeddings using hnsw (embedding vector_cosine_ops);

-- Data Eviction Policy: Delete watch_progress records older than 90 days
-- Note: This requires pg_cron to be active in your Supabase project.
select cron.schedule(
  'cleanup-old-watch-progress',
  '0 0 * * *', -- Every day at midnight
  $$ delete from public.watch_progress where last_watched_at < now() - interval '90 days' $$
);

-- Function for Vector Similarity Search (KNN)
create or replace function match_media (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  media_id text,
  title text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    me.id,
    me.media_id,
    me.title,
    1 - (me.embedding <=> query_embedding) as similarity
  from media_embeddings me
  where 1 - (me.embedding <=> query_embedding) > match_threshold
  order by me.embedding <=> query_embedding
  limit match_count;
end;
$$;
