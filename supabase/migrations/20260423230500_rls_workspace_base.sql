create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = auth.uid()
      and wm.is_active = true
  );
$$;

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.profile_id = auth.uid()
      and wm.is_active = true
      and wm.role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspace_members enable row level security;
alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;

create policy "profiles_select_self"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_update_self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "workspace_members_select_own_memberships"
on public.workspace_members
for select
using (profile_id = auth.uid());

create policy "agents_select_workspace_members"
on public.agents
for select
using (public.is_workspace_member(workspace_id));

create policy "agents_insert_admin_roles"
on public.agents
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "agents_update_admin_roles"
on public.agents
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "properties_select_workspace_members"
on public.properties
for select
using (public.is_workspace_member(workspace_id));

create policy "properties_insert_team_roles"
on public.properties
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'agent']::public.workspace_role[]));

create policy "properties_update_team_roles"
on public.properties
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'agent']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'agent']::public.workspace_role[]));

create policy "property_images_select_workspace_members"
on public.property_images
for select
using (public.is_workspace_member(workspace_id));

create policy "property_images_insert_team_roles"
on public.property_images
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'agent']::public.workspace_role[]));

create policy "property_images_update_team_roles"
on public.property_images
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'agent']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'agent']::public.workspace_role[]));

comment on function public.is_workspace_member(uuid) is 'Confirma si el usuario autenticado pertenece de forma activa al workspace.';
comment on function public.has_workspace_role(uuid, public.workspace_role[]) is 'Confirma si el usuario autenticado pertenece al workspace con alguno de los roles permitidos.';
