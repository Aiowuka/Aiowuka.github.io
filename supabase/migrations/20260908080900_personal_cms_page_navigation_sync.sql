create unique index if not exists navigation_items_page_unique_idx
  on public.navigation_items(page_id)
  where page_id is not null;

create or replace function private.sync_page_navigation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_href text;
  target_label text;
begin
  target_href := case when new.slug = 'home' then '/' else '/' || new.slug end;
  target_label := coalesce(nullif(new.nav_label, ''), new.title);

  if new.show_in_nav then
    insert into public.navigation_items(
      label, href, page_id, audience, enabled, sort_order, created_by
    ) values (
      target_label, target_href, new.id, 'public', true, new.sort_order,
      coalesce(new.created_by, (select auth.uid()))
    )
    on conflict (page_id) where page_id is not null
    do update set
      label = excluded.label,
      href = excluded.href,
      enabled = true,
      sort_order = excluded.sort_order,
      updated_at = now();
  else
    update public.navigation_items
      set enabled = false, updated_at = now()
      where page_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_page_navigation() from public, anon, authenticated;

drop trigger if exists pages_sync_navigation on public.pages;
create trigger pages_sync_navigation
after insert or update of slug, nav_label, title, show_in_nav, sort_order
on public.pages
for each row execute function private.sync_page_navigation();
