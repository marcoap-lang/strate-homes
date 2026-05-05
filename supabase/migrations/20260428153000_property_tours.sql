create table public.property_tours (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  slug text not null,
  title text not null,
  intro_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, slug)
);

create table public.property_tour_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  tour_id uuid not null references public.property_tours (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (tour_id, property_id)
);

create index idx_property_tours_workspace_id on public.property_tours (workspace_id);
create index idx_property_tours_lead_id on public.property_tours (lead_id);
create index idx_property_tour_items_tour_id on public.property_tour_items (tour_id);
create index idx_property_tour_items_property_id on public.property_tour_items (property_id);

create trigger set_property_tours_updated_at
before update on public.property_tours
for each row
execute function public.set_updated_at();

alter table public.property_tours enable row level security;
alter table public.property_tour_items enable row level security;

create policy "property_tours_select_workspace_members"
on public.property_tours
for select
using (public.is_workspace_member(workspace_id));

create policy "property_tours_insert_workspace_roles"
on public.property_tours
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

create policy "property_tours_update_workspace_roles"
on public.property_tours
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

create policy "property_tour_items_select_workspace_members"
on public.property_tour_items
for select
using (public.is_workspace_member(workspace_id));

create policy "property_tour_items_insert_workspace_roles"
on public.property_tour_items
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

create policy "property_tour_items_update_workspace_roles"
on public.property_tour_items
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));
