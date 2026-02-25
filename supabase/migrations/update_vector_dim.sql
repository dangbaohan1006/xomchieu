-- Xóa hàm và bảng cũ (vì không thể alter type của cột vector đang có data/index)
drop function if exists match_media;
drop table if exists public.media_embeddings;

-- 1. Tạo lại bảng với vector(768) dành riêng cho Gemini
create table if not exists public.media_embeddings (
  id uuid primary key default gen_random_uuid(),
  media_id text unique not null,
  title text not null,
  description text,
  embedding vector(768), -- Đã đổi từ 1536 sang 768
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Tạo lại Index HNSW để tối ưu KNN Search
create index on public.media_embeddings using hnsw (embedding vector_cosine_ops);

-- 3. Tạo lại hàm RPC với input vector(768)
create or replace function match_media (
  query_embedding vector(768), -- Đã đổi từ 1536 sang 768
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
