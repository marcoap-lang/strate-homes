alter table public.leads
add column if not exists preferred_operation public.operation_type,
add column if not exists preferred_property_type public.property_type,
add column if not exists preferred_location text,
add column if not exists budget_min numeric(14,2),
add column if not exists budget_max numeric(14,2),
add column if not exists bedrooms_min integer,
add column if not exists urgency text,
add column if not exists lost_reason text;

create table if not exists public.lead_appointments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  assigned_agent_id uuid references public.agents(id) on delete set null,
  title text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  result_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint lead_appointments_status_check check (status in ('scheduled', 'completed', 'cancelled', 'no_show'))
);

create table if not exists public.workspace_lead_assignment_rules (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  mode text not null default 'manual',
  last_assigned_agent_id uuid references public.agents(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workspace_lead_assignment_rules_mode_check check (mode in ('manual', 'round_robin'))
);

create index if not exists idx_lead_appointments_workspace_id on public.lead_appointments (workspace_id);
create index if not exists idx_lead_appointments_lead_id on public.lead_appointments (lead_id);
create index if not exists idx_lead_appointments_agent_id on public.lead_appointments (assigned_agent_id);
create index if not exists idx_lead_appointments_scheduled_at on public.lead_appointments (scheduled_at);
create index if not exists idx_leads_assigned_agent_id on public.leads (assigned_agent_id);
create index if not exists idx_leads_preferences on public.leads (workspace_id, preferred_operation, preferred_property_type);

drop trigger if exists set_lead_appointments_updated_at on public.lead_appointments;
create trigger set_lead_appointments_updated_at
before update on public.lead_appointments
for each row execute function public.set_updated_at();

drop trigger if exists set_workspace_lead_assignment_rules_updated_at on public.workspace_lead_assignment_rules;
create trigger set_workspace_lead_assignment_rules_updated_at
before update on public.workspace_lead_assignment_rules
for each row execute function public.set_updated_at();

alter table public.lead_appointments enable row level security;
alter table public.workspace_lead_assignment_rules enable row level security;

drop policy if exists "lead_appointments_select_workspace_members" on public.lead_appointments;
create policy "lead_appointments_select_workspace_members"
on public.lead_appointments
for select
using (public.is_workspace_member(workspace_id) or public.is_platform_admin());

drop policy if exists "lead_appointments_manage_workspace_roles" on public.lead_appointments;
create policy "lead_appointments_manage_workspace_roles"
on public.lead_appointments
for all
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff', 'agent']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff', 'agent']::public.workspace_role[]));

drop policy if exists "workspace_lead_assignment_rules_select_members" on public.workspace_lead_assignment_rules;
create policy "workspace_lead_assignment_rules_select_members"
on public.workspace_lead_assignment_rules
for select
using (public.is_workspace_member(workspace_id) or public.is_platform_admin());

drop policy if exists "workspace_lead_assignment_rules_manage_roles" on public.workspace_lead_assignment_rules;
create policy "workspace_lead_assignment_rules_manage_roles"
on public.workspace_lead_assignment_rules
for all
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

comment on table public.lead_appointments is 'Citas, visitas y seguimientos presenciales vinculados a clientes/leads.';
comment on table public.workspace_lead_assignment_rules is 'Reglas simples de asignación comercial por workspace.';
