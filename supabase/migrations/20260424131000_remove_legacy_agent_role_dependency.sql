create or replace function public.has_commercial_agent_profile(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agents a
    where a.workspace_id = target_workspace_id
      and a.profile_id = auth.uid()
      and a.is_active = true
  );
$$;

create or replace function public.can_create_property(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_workspace_role(target_workspace_id, array['owner', 'admin']::public.workspace_role[])
    or public.has_commercial_agent_profile(target_workspace_id);
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

drop policy if exists "properties_insert_team_roles" on public.properties;
drop policy if exists "properties_update_team_roles" on public.properties;
drop policy if exists "property_images_insert_team_roles" on public.property_images;
drop policy if exists "property_images_update_team_roles" on public.property_images;

create policy "properties_insert_team_roles"
on public.properties
for insert
with check (
  public.can_create_property(workspace_id)
  and created_by = auth.uid()
  and (
    public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
    or agent_id is null
    or exists (
      select 1
      from public.agents a
      where a.id = agent_id
        and a.workspace_id = workspace_id
        and a.profile_id = auth.uid()
        and a.is_active = true
    )
  )
);

create policy "properties_update_team_roles"
on public.properties
for update
using (public.can_manage_property(id))
with check (
  public.can_manage_property(id)
  and (
    public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[])
    or created_by = auth.uid()
    or (
      public.is_assigned_property_agent(id)
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
  )
);

create policy "property_images_insert_team_roles"
on public.property_images
for insert
with check (public.can_manage_property(property_id));

create policy "property_images_update_team_roles"
on public.property_images
for update
using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

comment on function public.has_commercial_agent_profile(uuid) is 'Confirma si el usuario autenticado tiene perfil comercial activo de agente dentro del workspace.';
comment on function public.can_create_property(uuid) is 'Autoriza creación de propiedades por owner/admin o por usuarios con perfil comercial de agente activo.';
comment on function public.can_manage_property(uuid) is 'Autoriza gestión de propiedad por owner/admin, creador o agente comercial asignado; no depende del rol legacy agent.';
