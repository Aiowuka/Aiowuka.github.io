-- Personal CMS v1. Depends on 20260908_access_control_v1.sql.

alter table public.content_items
  add column if not exists content_type text not null default 'note',
  add column if not exists featured boolean not null default false,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists published_at timestamptz;

create index if not exists content_items_type_published_idx
  on public.content_items (content_type, published, featured, sort_order, created_at desc);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  nav_label text,
  summary text,
  template text not null default 'standard',
  collection_type text,
  visibility public.content_visibility not null default 'public',
  published boolean not null default false,
  sort_order integer not null default 0,
  show_in_nav boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_access (
  page_id uuid not null references public.pages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (page_id,user_id)
);

create table if not exists public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  block_key text not null,
  kind text not null default 'text',
  label text,
  title text,
  body_markdown text not null default '',
  data jsonb not null default '{}'::jsonb,
  visibility public.content_visibility not null default 'public',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id,block_key)
);

create table if not exists public.block_access (
  block_id uuid not null references public.page_blocks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(block_id,user_id)
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  page_id uuid references public.pages(id) on delete set null,
  audience text not null default 'public' check (audience in ('public','member','owner')),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  byte_size bigint,
  title text,
  alt_text text,
  caption text,
  visibility public.content_visibility not null default 'owner',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_access (
  media_id uuid not null references public.media_assets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(media_id,user_id)
);

alter table public.content_items
  add column if not exists cover_media_id uuid references public.media_assets(id) on delete set null;

create table if not exists public.content_versions (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_key text not null,
  action text not null check (action in ('UPDATE','DELETE')),
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists pages_visibility_published_idx on public.pages(visibility,published,sort_order);
create index if not exists page_blocks_page_order_idx on public.page_blocks(page_id,sort_order);
create index if not exists page_access_user_idx on public.page_access(user_id,page_id);
create index if not exists block_access_user_idx on public.block_access(user_id,block_id);
create index if not exists navigation_order_idx on public.navigation_items(enabled,sort_order);
create index if not exists media_visibility_idx on public.media_assets(visibility,created_at desc);
create index if not exists media_access_user_idx on public.media_access(user_id,media_id);
create index if not exists content_versions_entity_idx on public.content_versions(entity_type,entity_key,created_at desc);

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at before update on public.pages for each row execute function private.set_updated_at();
drop trigger if exists page_blocks_set_updated_at on public.page_blocks;
create trigger page_blocks_set_updated_at before update on public.page_blocks for each row execute function private.set_updated_at();
drop trigger if exists navigation_items_set_updated_at on public.navigation_items;
create trigger navigation_items_set_updated_at before update on public.navigation_items for each row execute function private.set_updated_at();
drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at before update on public.media_assets for each row execute function private.set_updated_at();

create or replace function private.capture_cms_version()
returns trigger language plpgsql security definer set search_path=''
as $$
declare old_json jsonb; key_text text;
begin
  old_json := to_jsonb(old);
  key_text := coalesce(old_json->>'id',old_json->>'key','unknown');
  insert into public.content_versions(entity_type,entity_key,action,snapshot,created_by)
  values(TG_ARGV[0],key_text,TG_OP,old_json,(select auth.uid()));
  return case when TG_OP='DELETE' then old else new end;
end;
$$;
revoke all on function private.capture_cms_version() from public,anon,authenticated;

drop trigger if exists pages_capture_version on public.pages;
create trigger pages_capture_version before update or delete on public.pages for each row execute function private.capture_cms_version('page');
drop trigger if exists page_blocks_capture_version on public.page_blocks;
create trigger page_blocks_capture_version before update or delete on public.page_blocks for each row execute function private.capture_cms_version('block');
drop trigger if exists content_items_capture_version on public.content_items;
create trigger content_items_capture_version before update or delete on public.content_items for each row execute function private.capture_cms_version('content');
drop trigger if exists navigation_capture_version on public.navigation_items;
create trigger navigation_capture_version before update or delete on public.navigation_items for each row execute function private.capture_cms_version('navigation');
drop trigger if exists site_settings_capture_version on public.site_settings;
create trigger site_settings_capture_version before update or delete on public.site_settings for each row execute function private.capture_cms_version('setting');

alter table public.pages enable row level security;
alter table public.page_access enable row level security;
alter table public.page_blocks enable row level security;
alter table public.block_access enable row level security;
alter table public.navigation_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_access enable row level security;
alter table public.content_versions enable row level security;

revoke all on public.pages,public.page_access,public.page_blocks,public.block_access,public.navigation_items,public.site_settings,public.media_assets,public.media_access,public.content_versions from anon,authenticated;
grant select on public.pages,public.page_blocks,public.navigation_items,public.site_settings,public.media_assets to anon;
grant select,insert,update,delete on public.pages,public.page_blocks,public.navigation_items,public.site_settings,public.media_assets to authenticated;
grant select,insert,delete on public.page_access,public.block_access,public.media_access to authenticated;
grant select on public.content_versions to authenticated;

create policy pages_select_anon on public.pages for select to anon using(published and visibility='public');
create policy pages_select_authenticated on public.pages for select to authenticated using(
 private.is_owner() or (published and (visibility='public' or (private.is_approved_member() and (visibility='member' or (visibility='selected' and exists(select 1 from public.page_access pa where pa.page_id=pages.id and pa.user_id=(select auth.uid())))))))
);
create policy pages_owner_insert on public.pages for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy pages_owner_update on public.pages for update to authenticated using(private.is_owner()) with check(private.is_owner());
create policy pages_owner_delete on public.pages for delete to authenticated using(private.is_owner());

create policy page_access_self_or_owner on public.page_access for select to authenticated using(user_id=(select auth.uid()) or private.is_owner());
create policy page_access_owner_insert on public.page_access for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy page_access_owner_delete on public.page_access for delete to authenticated using(private.is_owner());

create policy blocks_select_anon on public.page_blocks for select to anon using(
 published and visibility='public' and exists(select 1 from public.pages p where p.id=page_blocks.page_id and p.published and p.visibility='public')
);
create policy blocks_select_authenticated on public.page_blocks for select to authenticated using(
 private.is_owner() or (published and exists(select 1 from public.pages p where p.id=page_blocks.page_id) and (visibility='public' or (private.is_approved_member() and (visibility='member' or (visibility='selected' and exists(select 1 from public.block_access ba where ba.block_id=page_blocks.id and ba.user_id=(select auth.uid())))))))
);
create policy blocks_owner_insert on public.page_blocks for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy blocks_owner_update on public.page_blocks for update to authenticated using(private.is_owner()) with check(private.is_owner());
create policy blocks_owner_delete on public.page_blocks for delete to authenticated using(private.is_owner());

create policy block_access_self_or_owner on public.block_access for select to authenticated using(user_id=(select auth.uid()) or private.is_owner());
create policy block_access_owner_insert on public.block_access for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy block_access_owner_delete on public.block_access for delete to authenticated using(private.is_owner());

create policy navigation_select_anon on public.navigation_items for select to anon using(enabled and audience='public');
create policy navigation_select_authenticated on public.navigation_items for select to authenticated using(private.is_owner() or (enabled and (audience='public' or (audience='member' and private.is_approved_member()))));
create policy navigation_owner_insert on public.navigation_items for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy navigation_owner_update on public.navigation_items for update to authenticated using(private.is_owner()) with check(private.is_owner());
create policy navigation_owner_delete on public.navigation_items for delete to authenticated using(private.is_owner());

create policy settings_select_anon on public.site_settings for select to anon using(is_public);
create policy settings_select_authenticated on public.site_settings for select to authenticated using(is_public or private.is_owner());
create policy settings_owner_insert on public.site_settings for insert to authenticated with check(private.is_owner() and updated_by=(select auth.uid()));
create policy settings_owner_update on public.site_settings for update to authenticated using(private.is_owner()) with check(private.is_owner());
create policy settings_owner_delete on public.site_settings for delete to authenticated using(private.is_owner());

create policy media_select_anon on public.media_assets for select to anon using(visibility='public');
create policy media_select_authenticated on public.media_assets for select to authenticated using(
 private.is_owner() or visibility='public' or (private.is_approved_member() and (visibility='member' or (visibility='selected' and exists(select 1 from public.media_access ma where ma.media_id=media_assets.id and ma.user_id=(select auth.uid())))))
);
create policy media_owner_insert on public.media_assets for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy media_owner_update on public.media_assets for update to authenticated using(private.is_owner()) with check(private.is_owner());
create policy media_owner_delete on public.media_assets for delete to authenticated using(private.is_owner());
create policy media_access_self_or_owner on public.media_access for select to authenticated using(user_id=(select auth.uid()) or private.is_owner());
create policy media_access_owner_insert on public.media_access for insert to authenticated with check(private.is_owner() and created_by=(select auth.uid()));
create policy media_access_owner_delete on public.media_access for delete to authenticated using(private.is_owner());
create policy versions_owner_select on public.content_versions for select to authenticated using(private.is_owner());

insert into storage.buckets(id,name,public) values('site-media','site-media',false) on conflict(id) do update set public=false;
create policy site_media_owner_insert on storage.objects for insert to authenticated with check(bucket_id='site-media' and private.is_owner());
create policy site_media_owner_update on storage.objects for update to authenticated using(bucket_id='site-media' and private.is_owner()) with check(bucket_id='site-media' and private.is_owner());
create policy site_media_owner_delete on storage.objects for delete to authenticated using(bucket_id='site-media' and private.is_owner());
create policy site_media_select_anon on storage.objects for select to anon using(bucket_id='site-media' and exists(select 1 from public.media_assets m where m.storage_path=name and m.visibility='public'));
create policy site_media_select_authenticated on storage.objects for select to authenticated using(
 bucket_id='site-media' and (private.is_owner() or exists(select 1 from public.media_assets m where m.storage_path=name and (m.visibility='public' or (private.is_approved_member() and (m.visibility='member' or (m.visibility='selected' and exists(select 1 from public.media_access ma where ma.media_id=m.id and ma.user_id=(select auth.uid()))))))))
);

insert into public.pages(slug,title,nav_label,summary,template,collection_type,visibility,published,sort_order,show_in_nav)
values
 ('home','Home','Home','A small personal corner of the internet.','home',null,'public',true,0,true),
 ('now','Now','Now','What I am doing, learning and thinking about right now.','now',null,'public',true,10,true),
 ('research','Research','Research','Research threads, experiments and papers.','collection','research','public',true,20,true),
 ('projects','Projects','Projects','Systems, hardware and software I am building.','collection','project','public',true,30,true),
 ('notes','Notes','Notes','Technical notes, study records and thoughts.','collection','note','public',true,40,true),
 ('photos','Photos','Photos','Places, weather and moments worth keeping.','collection','photo','public',true,50,true),
 ('music','Music','Music','What I have been listening to lately.','collection','music','public',true,60,true),
 ('about','About','About','A little more about me.','about',null,'public',true,70,true)
on conflict(slug) do update set title=excluded.title,nav_label=excluded.nav_label,summary=excluded.summary,template=excluded.template,collection_type=excluded.collection_type,sort_order=excluded.sort_order,show_in_nav=excluded.show_in_nav;

insert into public.navigation_items(label,href,page_id,audience,enabled,sort_order)
select p.nav_label,case when p.slug='home' then '/' else '/'||p.slug end,p.id,'public',true,p.sort_order
from public.pages p where p.slug in('home','now','research','projects','notes','photos','music','about')
and not exists(select 1 from public.navigation_items n where n.href=case when p.slug='home' then '/' else '/'||p.slug end);

insert into public.site_settings(key,value,is_public) values
 ('site_name','"AIowuka"'::jsonb,true),('location','"Nanjing, China"'::jsonb,true),('school','"NUAA"'::jsonb,true),
 ('hero_title','"Record. Build. Keep going."'::jsonb,true),
 ('hero_body','"我是飞行器控制与信息工程方向的学生，对技术、世界和生活都充满好奇。喜欢动手，喜欢思考，也喜欢记录。"'::jsonb,true),
 ('portal_note','"有些东西我只想留给熟悉的人。登录不自动获得权限，但可以先敲门。"'::jsonb,true)
on conflict(key) do nothing;

insert into public.page_blocks(page_id,block_key,kind,label,title,body_markdown,data,visibility,published,sort_order)
select p.id,'current','status','NOW','Right now','辅导员 AI 系统 · 上线准备\n群体智能 / K-space 研究\n无人机与机器人相关项目\n数学建模 · 准备中\n记录一些生活与思考','{}'::jsonb,'public',true,10 from public.pages p where p.slug='home'
on conflict(page_id,block_key) do nothing;

insert into public.page_blocks(page_id,block_key,kind,label,title,body_markdown,data,visibility,published,sort_order)
select p.id,'intro','text','ABOUT','About me','我是飞行器控制与信息工程方向的学生，对技术、世界和生活都充满好奇。喜欢动手，喜欢思考，也喜欢记录。希望在这个有点混乱但很美的世界里，构建一些有价值的东西。','{}'::jsonb,'public',true,20 from public.pages p where p.slug='about'
on conflict(page_id,block_key) do nothing;
