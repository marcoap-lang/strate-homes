-- Make curated property tours shareable without exposing private lead records.

alter table public.property_tours
add column if not exists public_enabled boolean not null default true;

create index if not exists idx_property_tours_public_lookup
on public.property_tours (workspace_id, slug)
where public_enabled = true;

create policy "property_tours_select_public_enabled"
on public.property_tours
for select
using (public_enabled = true);

create policy "property_tour_items_select_public_enabled_tours"
on public.property_tour_items
for select
using (
  exists (
    select 1
    from public.property_tours t
    where t.id = property_tour_items.tour_id
      and t.public_enabled = true
  )
);
