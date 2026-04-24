alter table public.properties
add column if not exists created_by uuid references public.profiles (id) on delete set null;

create index if not exists idx_properties_created_by on public.properties (created_by);

update public.properties p
set created_by = coalesce(a.profile_id, created_by)
from public.agents a
where p.agent_id = a.id
  and p.created_by is null;

create or replace function public.set_property_created_by_default()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

create or replace function public.is_assigned_property_agent(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.properties p
    join public.agents a
      on a.id = p.agent_id
    where p.id = target_property_id
      and a.profile_id = auth.uid()
      and a.is_active = true
  );
$$;

create or replace function public.can_manage_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.properties p
    where p.id = target_property_id
      and (
        public.has_workspace_role(p.workspace_id, array['owner', 'admin']::public.workspace_role[])
        or p.created_by = auth.uid()
        or public.is_assigned_property_agent(p.id)
      )
  );
$$;

create trigger set_property_created_by_default_trigger
before insert on public.properties
for each row
execute function public.set_property_created_by_default();

drop policy if exists "properties_insert_team_roles" on public.properties;
drop policy if exists "properties_update_team_roles" on public.properties;
drop policy if exists "property_images_insert_team_roles" on public.property_images;
drop policy if exists "property_images_update_team_roles" on public.property_images;

create policy "properties_insert_team_roles"
on public.properties
for insert
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
  or (
    public.has_workspace_role(workspace_id, array['agent']::public.workspace_role[])
    and created_by = auth.uid()
    and (
      agent_id is null
      or exists (
        select 1
        from public.agents a
        where a.id = agent_id
          and a.workspace_id = workspace_id
          and a.profile_id = auth.uid()
          and a.is_active = true
      )
    )
  )
);

create policy "properties_update_team_roles"
on public.properties
for update
using (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
  or public.can_manage_property(id)
)
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
  or (
    public.can_manage_property(id)
    and created_by = auth.uid()
    and (
      agent_id is null
      or exists (
        select 1
        from public.agents a
        where a.id = agent_id
          and a.workspace_id = workspace_id
          and a.profile_id = auth.uid()
          and a.is_active = true
      )
    )
  )
);

create policy "property_images_insert_team_roles"
on public.property_images
for insert
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
  or public.can_manage_property(property_id)
);

create policy "property_images_update_team_roles"
on public.property_images
for update
using (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
  or public.can_manage_property(property_id)
)
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
  or public.can_manage_property(property_id)
);

comment on column public.properties.created_by is 'Perfil autenticado que creó originalmente la propiedad dentro del workspace.';
comment on function public.set_property_created_by_default() is 'Completa created_by con auth.uid() si no llega explícito al insertar propiedades.';
comment on function public.is_assigned_property_agent(uuid) is 'Confirma si el usuario autenticado es el agente asignado a una propiedad.';
comment on function public.can_manage_property(uuid) is 'Define el alcance operativo permitido para editar una propiedad: owner/admin, creador o agente asignado.';
