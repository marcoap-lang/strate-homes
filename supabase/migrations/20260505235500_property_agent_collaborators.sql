create table if not exists public.property_agent_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint property_agent_assignments_unique unique (property_id, agent_id)
);

create index if not exists idx_property_agent_assignments_workspace_id on public.property_agent_assignments (workspace_id);
create index if not exists idx_property_agent_assignments_property_id on public.property_agent_assignments (property_id);
create index if not exists idx_property_agent_assignments_agent_id on public.property_agent_assignments (agent_id);

alter table public.property_agent_assignments enable row level security;

create policy "property_agent_assignments_select_workspace_members"
on public.property_agent_assignments
for select
using (
  public.is_workspace_member(workspace_id)
  or exists (
    select 1
    from public.properties p
    join public.agents a on a.id = property_agent_assignments.agent_id
    where p.id = property_agent_assignments.property_id
      and p.workspace_id = property_agent_assignments.workspace_id
      and p.status = 'active'
      and p.published_at is not null
      and a.is_public = true
      and a.is_active = true
  )
);

create policy "property_agent_assignments_insert_manage_property"
on public.property_agent_assignments
for insert
with check (
  public.can_manage_property(property_id)
  and exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.workspace_id = workspace_id
  )
  and exists (
    select 1
    from public.agents a
    where a.id = agent_id
      and a.workspace_id = workspace_id
      and a.is_active = true
  )
);

create policy "property_agent_assignments_delete_manage_property"
on public.property_agent_assignments
for delete
using (public.can_manage_property(property_id));

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
    join public.agents a on a.id = p.agent_id
    where p.id = target_property_id
      and a.profile_id = auth.uid()
      and a.is_active = true
  )
  or exists (
    select 1
    from public.property_agent_assignments paa
    join public.agents a on a.id = paa.agent_id
    where paa.property_id = target_property_id
      and a.profile_id = auth.uid()
      and a.is_active = true
  );
$$;

comment on table public.property_agent_assignments is 'Asesores colaboradores de una propiedad. El asesor principal sigue viviendo en properties.agent_id.';
comment on column public.properties.agent_id is 'Asesor principal/responsable comercial de la propiedad.';
