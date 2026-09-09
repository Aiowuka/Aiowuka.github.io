create or replace function private.enforce_home_page_invariant()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if TG_OP = 'DELETE' then
    if old.slug = 'home' then
      raise exception 'HOME_PAGE_CANNOT_BE_DELETED' using errcode = '23514';
    end if;
    return old;
  end if;

  if new.slug = 'home' or (TG_OP = 'UPDATE' and old.slug = 'home') then
    new.slug := 'home';
    new.template := 'home';
    new.published := true;
  end if;

  return new;
end;
$$;

drop trigger if exists pages_home_invariant on public.pages;
create trigger pages_home_invariant
before insert or update or delete on public.pages
for each row execute function private.enforce_home_page_invariant();
