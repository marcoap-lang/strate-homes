alter type public.lead_status add value if not exists 'visited';
alter type public.lead_status add value if not exists 'negotiation';
alter type public.lead_status add value if not exists 'closed';

alter table public.leads
add column if not exists assigned_agent_id uuid references public.agents (id) on delete set null,
add column if not exists next_follow_up_at timestamptz,
add column if not exists last_contacted_at timestamptz;

create index if not exists idx_leads_assigned_agent_id on public.leads (assigned_agent_id);
create index if not exists idx_leads_next_follow_up_at on public.leads (next_follow_up_at);

create table if not exists public.lead_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  assigned_agent_id uuid references public.agents (id) on delete set null,
  title text not null,
  due_at timestamptz,
  status text not null default 'open',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint lead_tasks_status_check check (status in ('open', 'done', 'cancelled'))
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_profile_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_admins (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_subscriptions (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  plan text not null default 'solo',
  status text not null default 'trial',
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  external_customer_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workspace_subscriptions_plan_check check (plan in ('solo', 'small_agency', 'agency')),
  constraint workspace_subscriptions_status_check check (status in ('trial', 'active', 'past_due', 'cancelled'))
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_lead_tasks_workspace_id on public.lead_tasks (workspace_id);
create index if not exists idx_lead_tasks_lead_id on public.lead_tasks (lead_id);
create index if not exists idx_lead_tasks_due_at on public.lead_tasks (due_at);
create index if not exists idx_lead_notes_workspace_id on public.lead_notes (workspace_id);
create index if not exists idx_lead_notes_lead_id on public.lead_notes (lead_id);
create index if not exists idx_activity_events_workspace_id on public.activity_events (workspace_id);
create index if not exists idx_activity_events_created_at on public.activity_events (created_at desc);
create index if not exists idx_workspace_subscriptions_status on public.workspace_subscriptions (status);

create trigger set_lead_tasks_updated_at
before update on public.lead_tasks
for each row
execute function public.set_updated_at();

create trigger set_workspace_subscriptions_updated_at
before update on public.workspace_subscriptions
for each row
execute function public.set_updated_at();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.profile_id = auth.uid()
  );
$$;

alter table public.lead_tasks enable row level security;
alter table public.lead_notes enable row level security;
alter table public.platform_admins enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.activity_events enable row level security;

create policy "lead_tasks_select_workspace_members"
on public.lead_tasks
for select
using (public.is_workspace_member(workspace_id) or public.is_platform_admin());

create policy "lead_tasks_insert_workspace_roles"
on public.lead_tasks
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff', 'agent']::public.workspace_role[]));

create policy "lead_tasks_update_workspace_roles"
on public.lead_tasks
for update
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff', 'agent']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff', 'agent']::public.workspace_role[]));

create policy "lead_notes_select_workspace_members"
on public.lead_notes
for select
using (public.is_workspace_member(workspace_id) or public.is_platform_admin());

create policy "lead_notes_insert_workspace_roles"
on public.lead_notes
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff', 'agent']::public.workspace_role[]));

create policy "platform_admins_select_platform_admins"
on public.platform_admins
for select
using (public.is_platform_admin());

create policy "workspace_subscriptions_select_platform_admins"
on public.workspace_subscriptions
for select
using (public.is_platform_admin());

create policy "workspace_subscriptions_manage_platform_admins"
on public.workspace_subscriptions
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "activity_events_select_workspace_or_platform"
on public.activity_events
for select
using ((workspace_id is not null and public.is_workspace_member(workspace_id)) or public.is_platform_admin());

create policy "activity_events_insert_workspace_or_platform"
on public.activity_events
for insert
with check ((workspace_id is not null and public.is_workspace_member(workspace_id)) or public.is_platform_admin());

create policy "profiles_select_platform_admins"
on public.profiles
for select
using (public.is_platform_admin());

create policy "workspace_members_select_platform_admins"
on public.workspace_members
for select
using (public.is_platform_admin());

create policy "agents_select_platform_admins"
on public.agents
for select
using (public.is_platform_admin());

create policy "properties_select_platform_admins"
on public.properties
for select
using (public.is_platform_admin());

create policy "property_images_select_platform_admins"
on public.property_images
for select
using (public.is_platform_admin());

create policy "leads_select_platform_admins"
on public.leads
for select
using (public.is_platform_admin());

create policy "lead_property_interests_select_platform_admins"
on public.lead_property_interests
for select
using (public.is_platform_admin());

comment on table public.lead_tasks is 'Tareas operativas de seguimiento comercial por lead.';
comment on table public.lead_notes is 'Historial interno de notas por lead.';
comment on table public.platform_admins is 'Allowlist de usuarios con acceso al panel interno de Strate.';
comment on table public.workspace_subscriptions is 'Estado comercial y límites de plan por inmobiliaria.';
comment on table public.activity_events is 'Bitácora mínima de uso y operación para soporte interno.';
