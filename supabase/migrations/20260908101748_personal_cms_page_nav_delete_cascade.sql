alter table public.navigation_items
  drop constraint if exists navigation_items_page_id_fkey;

alter table public.navigation_items
  add constraint navigation_items_page_id_fkey
  foreign key (page_id)
  references public.pages(id)
  on delete cascade;
