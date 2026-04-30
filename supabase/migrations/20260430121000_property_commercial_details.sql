alter table public.properties
  add column if not exists amenities text[] not null default '{}',
  add column if not exists extra_features text,
  add column if not exists short_description text;
