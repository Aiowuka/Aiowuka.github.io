drop policy if exists navigation_select_anon on public.navigation_items;
create policy navigation_select_anon on public.navigation_items for select to anon
using (
  enabled
  and audience = 'public'
  and (page_id is null or exists (select 1 from public.pages p where p.id = navigation_items.page_id))
);

drop policy if exists navigation_select_authenticated on public.navigation_items;
create policy navigation_select_authenticated on public.navigation_items for select to authenticated
using (
  private.is_owner()
  or (
    enabled
    and (audience = 'public' or (audience = 'member' and private.is_approved_member()))
    and (page_id is null or exists (select 1 from public.pages p where p.id = navigation_items.page_id))
  )
);
