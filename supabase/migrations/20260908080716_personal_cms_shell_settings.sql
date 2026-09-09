insert into public.site_settings(key,value,is_public)
values
  ('rail_mantra','"Same planet. Different perspective."'::jsonb,true),
  ('rail_note','"Good ideas usually start somewhere messy."'::jsonb,true),
  ('topbar_note','"AIowuka''s little corner of the internet"'::jsonb,true),
  ('hero_photo_note','"在复杂的世界里，做一个更有温度的探索者。"'::jsonb,true),
  ('hero_photo_caption','"same sky, different stories."'::jsonb,true),
  ('notes_note','"保持好奇，保持记录。"'::jsonb,true),
  ('planet_note_top','"A SMALL PERSON"'::jsonb,true),
  ('planet_note_bottom','"ON A BIG PLANET."'::jsonb,true)
on conflict (key) do nothing;
