alter table public.leads
  add column if not exists ad_campaign_request_id uuid references public.ad_campaign_requests(id) on delete set null;

alter table public.public_conversion_events
  add column if not exists ad_campaign_request_id uuid references public.ad_campaign_requests(id) on delete set null,
  add column if not exists utm_source text,
  add column if not exists utm_campaign text;

create index if not exists idx_leads_ad_campaign_request_id on public.leads(ad_campaign_request_id);
create index if not exists idx_public_conversion_events_ad_campaign_request_id on public.public_conversion_events(ad_campaign_request_id);
create index if not exists idx_public_conversion_events_utm_campaign on public.public_conversion_events(utm_campaign);

comment on column public.leads.ad_campaign_request_id is 'Solicitud de campaña interna que originó el lead, cuando llega desde links de publicidad de Strate Homes.';
comment on column public.public_conversion_events.ad_campaign_request_id is 'Solicitud de campaña interna asociada al evento público.';
