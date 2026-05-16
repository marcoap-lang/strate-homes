create table if not exists public.workspace_admin_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  author_profile_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.workspace_subscriptions
add column if not exists commercial_status text not null default 'prospect',
add constraint workspace_subscriptions_commercial_status_check check (commercial_status in ('prospect', 'demo', 'customer', 'risk', 'churn'));

create table if not exists public.workspace_followups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  assigned_profile_id uuid references public.profiles (id) on delete set null,
  title text not null,
  due_at timestamptz,
  status text not null default 'open',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workspace_followups_status_check check (status in ('open', 'done', 'cancelled'))
);

create table if not exists public.workspace_feature_flags (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  flag_key text not null,
  enabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (workspace_id, flag_key),
  constraint workspace_feature_flags_key_check check (flag_key ~ '^[a-z0-9_]+$')
);

create table if not exists public.platform_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all',
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint platform_announcements_audience_check check (audience in ('all', 'trial', 'active', 'past_due', 'cancelled'))
);

create index if not exists idx_workspace_admin_notes_workspace_id on public.workspace_admin_notes (workspace_id);
create index if not exists idx_workspace_admin_notes_created_at on public.workspace_admin_notes (created_at desc);
create index if not exists idx_workspace_followups_workspace_id on public.workspace_followups (workspace_id);
create index if not exists idx_workspace_followups_status_due on public.workspace_followups (status, due_at);
create index if not exists idx_workspace_feature_flags_workspace_id on public.workspace_feature_flags (workspace_id);
create index if not exists idx_platform_announcements_active on public.platform_announcements (is_active, starts_at, ends_at);

create trigger set_workspace_followups_updated_at
before update on public.workspace_followups
for each row
execute function public.set_updated_at();

create trigger set_platform_announcements_updated_at
before update on public.platform_announcements
for each row
execute function public.set_updated_at();

alter table public.workspace_admin_notes enable row level security;
alter table public.workspace_followups enable row level security;
alter table public.workspace_feature_flags enable row level security;
alter table public.platform_announcements enable row level security;

create policy "workspace_admin_notes_platform_admins"
on public.workspace_admin_notes
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "workspace_followups_platform_admins"
on public.workspace_followups
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "workspace_feature_flags_platform_admins"
on public.workspace_feature_flags
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "platform_announcements_platform_admins"
on public.platform_announcements
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "workspace_subscriptions_workspace_members_select"
on public.workspace_subscriptions
for select
using (workspace_id is not null and public.is_workspace_member(workspace_id));

comment on table public.workspace_admin_notes is 'Notas internas de Strate sobre una cuenta/inmobiliaria.';
comment on table public.workspace_followups is 'Seguimientos comerciales internos de Strate por cuenta.';
comment on table public.workspace_feature_flags is 'Banderas de producto configurables por workspace.';
comment on table public.platform_announcements is 'Anuncios globales o segmentados para la app del cliente.';
