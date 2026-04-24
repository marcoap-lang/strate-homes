create or replace function public.storage_object_workspace_prefix(object_name text)
returns uuid
language sql
stable
set search_path = public
as $$
  select nullif(split_part(object_name, '/', 1), '')::uuid;
$$;

create policy "property_images_bucket_select_public"
on storage.objects
for select
using (bucket_id = 'property-images');

create policy "property_images_bucket_insert_workspace_members"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and public.is_workspace_member(public.storage_object_workspace_prefix(name))
);

create policy "property_images_bucket_update_workspace_members"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and public.is_workspace_member(public.storage_object_workspace_prefix(name))
)
with check (
  bucket_id = 'property-images'
  and public.is_workspace_member(public.storage_object_workspace_prefix(name))
);

create policy "property_images_bucket_delete_workspace_members"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and public.is_workspace_member(public.storage_object_workspace_prefix(name))
);

comment on function public.storage_object_workspace_prefix(text) is 'Extrae el workspace_id desde el primer segmento del path en Storage para validar acceso al bucket property-images.';
