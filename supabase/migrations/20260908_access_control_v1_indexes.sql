-- Performance indexes for access-control v1.

create index if not exists profiles_approved_idx
  on public.profiles (approved, role);

create index if not exists content_items_created_by_idx
  on public.content_items (created_by);

create index if not exists content_access_created_by_idx
  on public.content_access (created_by);
