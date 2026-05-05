-- Allow anonymous/public visitors to read only intentionally published inventory.
-- Drafts, archived properties, private agents and non-published rows remain hidden.

create policy "properties_select_public_published"
on public.properties
for select
using (
  status = 'active'
  and published_at is not null
);

create policy "property_images_select_public_published"
on public.property_images
for select
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.status = 'active'
      and p.published_at is not null
  )
);

create policy "agents_select_public_profiles"
on public.agents
for select
using (
  is_active = true
  and is_public = true
);
