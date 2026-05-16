alter table public.leads
add column if not exists source_detail text,
add column if not exists utm_source text,
add column if not exists utm_campaign text,
add column if not exists landing_path text;

create table if not exists public.public_conversion_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  event_type text not null,
  path text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint public_conversion_events_event_type_check check (event_type in ('property_view', 'whatsapp_click', 'lead_form_submit', 'advisor_click', 'demo_request'))
);

create table if not exists public.workspace_message_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_key text not null,
  title text not null,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, template_key),
  constraint workspace_message_templates_key_check check (template_key in ('first_contact', 'follow_up', 'schedule_visit', 'send_listing', 'reactivate_lead'))
);

create index if not exists idx_public_conversion_events_workspace_id on public.public_conversion_events (workspace_id);
create index if not exists idx_public_conversion_events_property_id on public.public_conversion_events (property_id);
create index if not exists idx_public_conversion_events_created_at on public.public_conversion_events (created_at);
create index if not exists idx_workspace_message_templates_workspace_id on public.workspace_message_templates (workspace_id);

drop trigger if exists set_workspace_message_templates_updated_at on public.workspace_message_templates;
create trigger set_workspace_message_templates_updated_at
before update on public.workspace_message_templates
for each row execute function public.set_updated_at();

alter table public.public_conversion_events enable row level security;
alter table public.workspace_message_templates enable row level security;

drop policy if exists "public_conversion_events_insert_public" on public.public_conversion_events;
create policy "public_conversion_events_insert_public"
on public.public_conversion_events
for insert
with check (workspace_id is not null);

drop policy if exists "public_conversion_events_select_workspace_members" on public.public_conversion_events;
create policy "public_conversion_events_select_workspace_members"
on public.public_conversion_events
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "public_conversion_events_select_platform_admins" on public.public_conversion_events;
create policy "public_conversion_events_select_platform_admins"
on public.public_conversion_events
for select
using (public.is_platform_admin());

drop policy if exists "workspace_message_templates_select_members" on public.workspace_message_templates;
create policy "workspace_message_templates_select_members"
on public.workspace_message_templates
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_message_templates_manage_roles" on public.workspace_message_templates;
create policy "workspace_message_templates_manage_roles"
on public.workspace_message_templates
for all
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

drop policy if exists "workspace_message_templates_select_platform_admins" on public.workspace_message_templates;
create policy "workspace_message_templates_select_platform_admins"
on public.workspace_message_templates
for select
using (public.is_platform_admin());

comment on table public.public_conversion_events is 'Eventos públicos básicos para medir conversión comercial sin analytics externo.';
comment on table public.workspace_message_templates is 'Templates de WhatsApp y seguimiento comercial por inmobiliaria.';
