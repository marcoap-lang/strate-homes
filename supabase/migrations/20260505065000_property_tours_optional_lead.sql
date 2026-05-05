-- Allow general/shareable property tours that are not attached to a specific lead.

alter table public.property_tours
alter column lead_id drop not null;
