-- Allow workspace operators to delete obsolete tours and their items.

create policy "property_tours_delete_workspace_roles"
on public.property_tours
for delete
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

create policy "property_tour_items_delete_workspace_roles"
on public.property_tour_items
for delete
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));
