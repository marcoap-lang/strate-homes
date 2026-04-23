create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  brand_name text,
  brand_primary_color text,
  brand_accent_color text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workspaces_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  default_workspace_id uuid references public.workspaces (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  slug text not null,
  display_name text not null,
  title text,
  bio text,
  phone text,
  email text,
  whatsapp text,
  avatar_url text,
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint agents_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint agents_workspace_slug_unique unique (workspace_id, slug)
);

create type public.property_status as enum ('draft', 'active', 'pending', 'sold', 'rented', 'archived');
create type public.operation_type as enum ('sale', 'rent', 'both');
create type public.property_type as enum (
  'house',
  'apartment',
  'land',
  'office',
  'commercial',
  'warehouse',
  'building',
  'development',
  'mixed_use'
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  title text not null,
  slug text not null,
  public_code text,
  description text,
  property_type public.property_type not null,
  status public.property_status not null default 'draft',
  operation_type public.operation_type not null,
  is_featured boolean not null default false,
  location_label text not null,
  address_line text,
  neighborhood text,
  city text,
  state text,
  country_code text not null default 'MX',
  price_amount numeric(14,2),
  currency_code text not null default 'MXN',
  bedrooms integer,
  bathrooms numeric(4,1),
  parking_spots integer,
  lot_area_m2 numeric(12,2),
  construction_area_m2 numeric(12,2),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint properties_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint properties_workspace_slug_unique unique (workspace_id, slug),
  constraint properties_country_code_length check (char_length(country_code) = 2),
  constraint properties_currency_code_length check (char_length(currency_code) = 3),
  constraint properties_price_non_negative check (price_amount is null or price_amount >= 0),
  constraint properties_bedrooms_non_negative check (bedrooms is null or bedrooms >= 0),
  constraint properties_bathrooms_non_negative check (bathrooms is null or bathrooms >= 0),
  constraint properties_parking_non_negative check (parking_spots is null or parking_spots >= 0),
  constraint properties_lot_area_non_negative check (lot_area_m2 is null or lot_area_m2 >= 0),
  constraint properties_construction_area_non_negative check (construction_area_m2 is null or construction_area_m2 >= 0)
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_bucket text not null default 'property-images',
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint property_images_sort_order_non_negative check (sort_order >= 0),
  constraint property_images_storage_unique unique (storage_bucket, storage_path)
);

create index idx_profiles_default_workspace_id on public.profiles (default_workspace_id);
create index idx_agents_workspace_id on public.agents (workspace_id);
create index idx_agents_profile_id on public.agents (profile_id);
create index idx_properties_workspace_id on public.properties (workspace_id);
create index idx_properties_agent_id on public.properties (agent_id);
create index idx_properties_status on public.properties (status);
create index idx_properties_operation_type on public.properties (operation_type);
create index idx_property_images_workspace_id on public.property_images (workspace_id);
create index idx_property_images_property_id on public.property_images (property_id);
create index idx_property_images_cover_sort on public.property_images (property_id, is_cover desc, sort_order asc);

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_agents_updated_at
before update on public.agents
for each row
execute function public.set_updated_at();

create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

create trigger set_property_images_updated_at
before update on public.property_images
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

comment on table public.workspaces is 'Unidad base de operación comercial. Puede representar agente individual, equipo o inmobiliaria.';
comment on table public.profiles is 'Perfil privado del usuario autenticado en Supabase Auth.';
comment on table public.agents is 'Capa operativa y de presencia pública mínima para agentes dentro de un workspace.';
comment on table public.properties is 'Inventario inmobiliario mínimo del MVP inicial.';
comment on table public.property_images is 'Metadatos de imágenes ligadas a propiedades y almacenadas en Supabase Storage.';
