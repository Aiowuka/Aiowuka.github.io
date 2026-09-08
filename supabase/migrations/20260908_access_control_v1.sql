-- Access-control v1 canonical schema contract.
-- Applied to the connected Supabase project and kept here for reproducibility.

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

do $$ begin
  create type public.site_role as enum ('member', 'owner');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_visibility as enum ('public', 'member', 'selected', 'owner');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.site_role not null default 'member',
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text,
  body_markdown text not null default '',
  visibility public.content_visibility not null default 'owner',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_visibility_published_idx
  on public.content_items (visibility, published, sort_order, created_at desc);

create table if not exists public.content_access (
  content_id uuid not null references public.content_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (content_id, user_id)
);

create index if not exists content_access_user_idx
  on public.content_access (user_id, content_id);

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'owner'
  );
$$;

create or replace function private.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and approved = true
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    lower(coalesce(new.email, new.id::text || '@invalid.local')),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'member'), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.is_owner() from public;
revoke all on function private.is_approved_member() from public;
revoke all on function private.handle_new_user() from public;
revoke all on function private.handle_new_user() from anon;
revoke all on function private.handle_new_user() from authenticated;
revoke all on function private.set_updated_at() from public;

grant usage on schema private to authenticated;
grant execute on function private.is_owner() to authenticated;
grant execute on function private.is_approved_member() to authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute function private.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at
before update on public.content_items
for each row execute function private.set_updated_at();

insert into public.profiles (id, email, display_name)
select
  u.id,
  lower(coalesce(u.email, u.id::text || '@invalid.local')),
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, 'member'), '@', 1))
from auth.users u
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_access enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.content_items from anon, authenticated;
revoke all on public.content_access from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.content_items to anon;
grant select, insert, update, delete on public.content_items to authenticated;
grant select, insert, delete on public.content_access to authenticated;

drop policy if exists profiles_select_self_or_owner on public.profiles;
create policy profiles_select_self_or_owner
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or private.is_owner());

drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner
on public.profiles
for update
to authenticated
using (private.is_owner())
with check (private.is_owner());

drop policy if exists content_items_select_public on public.content_items;
create policy content_items_select_public
on public.content_items
for select
to anon
using (published and visibility = 'public');

drop policy if exists content_items_select_authenticated on public.content_items;
create policy content_items_select_authenticated
on public.content_items
for select
to authenticated
using (
  private.is_owner()
  or (
    published
    and private.is_approved_member()
    and (
      visibility in ('public', 'member')
      or (
        visibility = 'selected'
        and exists (
          select 1
          from public.content_access ca
          where ca.content_id = content_items.id
            and ca.user_id = (select auth.uid())
        )
      )
    )
  )
);

drop policy if exists content_items_insert_owner on public.content_items;
create policy content_items_insert_owner
on public.content_items
for insert
to authenticated
with check (private.is_owner() and created_by = (select auth.uid()));

drop policy if exists content_items_update_owner on public.content_items;
create policy content_items_update_owner
on public.content_items
for update
to authenticated
using (private.is_owner())
with check (private.is_owner());

drop policy if exists content_items_delete_owner on public.content_items;
create policy content_items_delete_owner
on public.content_items
for delete
to authenticated
using (private.is_owner());

drop policy if exists content_access_select_self_or_owner on public.content_access;
create policy content_access_select_self_or_owner
on public.content_access
for select
to authenticated
using (user_id = (select auth.uid()) or private.is_owner());

drop policy if exists content_access_insert_owner on public.content_access;
create policy content_access_insert_owner
on public.content_access
for insert
to authenticated
with check (private.is_owner() and created_by = (select auth.uid()));

drop policy if exists content_access_delete_owner on public.content_access;
create policy content_access_delete_owner
on public.content_access
for delete
to authenticated
using (private.is_owner());
