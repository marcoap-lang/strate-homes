alter table public.workspaces
  add column if not exists public_services text,
  add column if not exists public_trust_points text,
  add column if not exists public_address text,
  add column if not exists public_maps_url text,
  add column if not exists public_facebook_url text,
  add column if not exists public_instagram_url text,
  add column if not exists public_google_business_url text,
  add column if not exists public_privacy_url text;

create table if not exists public.ad_campaign_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  requested_by_profile_id uuid references public.profiles(id) on delete set null,
  objective text not null,
  channels text[] not null default '{}'::text[],
  monthly_budget_mxn numeric(12,2),
  target_area text,
  promoted_property_id uuid references public.properties(id) on delete set null,
  notes text,
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_campaign_requests_objective_check check (objective in ('leads', 'traffic', 'whatsapp', 'brand')),
  constraint ad_campaign_requests_status_check check (status in ('requested', 'reviewing', 'active', 'paused', 'completed', 'cancelled'))
);

create index if not exists idx_ad_campaign_requests_workspace_id on public.ad_campaign_requests(workspace_id);
create index if not exists idx_ad_campaign_requests_status on public.ad_campaign_requests(status);

drop trigger if exists set_ad_campaign_requests_updated_at on public.ad_campaign_requests;
create trigger set_ad_campaign_requests_updated_at
before update on public.ad_campaign_requests
for each row execute function public.set_updated_at();

alter table public.ad_campaign_requests enable row level security;

drop policy if exists "ad_campaign_requests_select_members" on public.ad_campaign_requests;
create policy "ad_campaign_requests_select_members"
on public.ad_campaign_requests
for select
using (public.is_workspace_member(workspace_id) or public.is_platform_admin());

drop policy if exists "ad_campaign_requests_insert_roles" on public.ad_campaign_requests;
create policy "ad_campaign_requests_insert_roles"
on public.ad_campaign_requests
for insert
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'staff']::public.workspace_role[]));

drop policy if exists "ad_campaign_requests_update_platform_admins" on public.ad_campaign_requests;
create policy "ad_campaign_requests_update_platform_admins"
on public.ad_campaign_requests
for update
using (public.is_platform_admin())
with check (public.is_platform_admin());

comment on table public.ad_campaign_requests is 'Solicitudes manuales para comprar campañas de Facebook, Instagram y Google Ads desde Strate Homes.';
