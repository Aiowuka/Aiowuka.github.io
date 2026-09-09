alter table public.content_items
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists content_items_tags_idx
  on public.content_items using gin(tags);
