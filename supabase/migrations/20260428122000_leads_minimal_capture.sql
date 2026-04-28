create type public.lead_status as enum ('new', 'contacted', 'interested', 'lost');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  message text,
  internal_note text,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.lead_property_interests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (lead_id, property_id)
);

create index idx_leads_workspace_id on public.leads (workspace_id);
create index idx_leads_status on public.leads (status);
create index idx_lead_property_interests_workspace_id on public.lead_property_interests (workspace_id);
create index idx_lead_property_interests_property_id on public.lead_property_interests (property_id);

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_property_interests enable row level security;

create policy "leads_select_workspace_members"
on public.leads
for select
using (public.is_workspace_member(workspace_id));

create policy "leads_insert_public"
on public.leads
for insert
with check (true);

create policy "leads_update_workspace_roles"
on public.leads
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

create policy "lead_property_interests_select_workspace_members"
on public.lead_property_interests
for select
using (public.is_workspace_member(workspace_id));

create policy "lead_property_interests_insert_public"
on public.lead_property_interests
for insert
with check (true);
