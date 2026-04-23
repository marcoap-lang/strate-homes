create type public.workspace_role as enum ('owner', 'admin', 'agent', 'staff');

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null,
  is_active boolean not null default true,
  invited_by uuid references public.profiles (id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workspace_members_unique_membership unique (workspace_id, profile_id)
);

create index idx_workspace_members_workspace_id on public.workspace_members (workspace_id);
create index idx_workspace_members_profile_id on public.workspace_members (profile_id);
create index idx_workspace_members_role on public.workspace_members (role);

create trigger set_workspace_members_updated_at
before update on public.workspace_members
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.phone,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.sync_user_profile_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = new.email,
    phone = new.phone,
    updated_at = timezone('utc', now())
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

create trigger on_auth_user_updated
after update of email, phone on auth.users
for each row
execute function public.sync_user_profile_updates();

comment on type public.workspace_role is 'Roles iniciales mínimos para pertenencia de usuarios a workspaces.';
comment on table public.workspace_members is 'Pertenencia de perfiles autenticados a workspaces con rol mínimo inicial.';
comment on function public.handle_new_user_profile() is 'Crea o sincroniza el perfil base cuando nace un usuario en Supabase Auth.';
comment on function public.sync_user_profile_updates() is 'Sincroniza cambios básicos de email y phone desde auth.users hacia profiles.';
