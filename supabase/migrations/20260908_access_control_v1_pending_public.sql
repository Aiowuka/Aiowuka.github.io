-- Keep PUBLIC content visible to authenticated-but-unapproved users.
-- Authentication proves identity; it must not reduce access to content that is public.

drop policy if exists content_items_select_authenticated on public.content_items;

create policy content_items_select_authenticated
on public.content_items
for select
to authenticated
using (
  private.is_owner()
  or (
    published
    and (
      visibility = 'public'
      or (
        private.is_approved_member()
        and (
          visibility = 'member'
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
    )
  )
);
