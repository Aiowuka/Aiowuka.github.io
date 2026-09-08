-- Access-control v1 is already applied to the connected Supabase project.
-- This file records the intended schema contract for source control.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

do $$ begin create type public.site_role as enum ('member', 'owner'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_visibility as enum ('public', 'member', 'selected', 'owner'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role public.site_role not null default 'member',
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.content_access (
  content_id uuid not null references public.content_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (content_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_access enable row level security;

-- Authorization is enforced through RLS policies and private helper functions.
-- See project README for the PUBLIC / MEMBER / SELECTED / OWNER model.
