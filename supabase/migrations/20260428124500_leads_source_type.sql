alter table public.leads
add column if not exists source_type text;
