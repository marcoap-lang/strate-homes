create or replace function public.set_profile_default_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_active = true then
    update public.profiles
    set
      default_workspace_id = coalesce(default_workspace_id, new.workspace_id),
      updated_at = timezone('utc', now())
    where id = new.profile_id;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_property_agent_workspace_match()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  agent_workspace_id uuid;
begin
  if new.agent_id is null then
    return new;
  end if;

  select workspace_id into agent_workspace_id
  from public.agents
  where id = new.agent_id;

  if agent_workspace_id is null then
    raise exception 'Agent % does not exist', new.agent_id;
  end if;

  if agent_workspace_id <> new.workspace_id then
    raise exception 'Property workspace_id must match agent workspace_id';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_property_image_workspace_match()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  property_workspace_id uuid;
begin
  select workspace_id into property_workspace_id
  from public.properties
  where id = new.property_id;

  if property_workspace_id is null then
    raise exception 'Property % does not exist', new.property_id;
  end if;

  if property_workspace_id <> new.workspace_id then
    raise exception 'Property image workspace_id must match property workspace_id';
  end if;

  return new;
end;
$$;

create trigger set_profile_default_workspace_from_membership
after insert on public.workspace_members
for each row
execute function public.set_profile_default_workspace();

create trigger ensure_property_agent_workspace_match_trigger
before insert or update on public.properties
for each row
execute function public.ensure_property_agent_workspace_match();

create trigger ensure_property_image_workspace_match_trigger
before insert or update on public.property_images
for each row
execute function public.ensure_property_image_workspace_match();

comment on function public.set_profile_default_workspace() is 'Asigna default_workspace_id al primer workspace activo del perfil cuando aún no tiene uno.';
comment on function public.ensure_property_agent_workspace_match() is 'Evita asignar una propiedad a un agente de otro workspace.';
comment on function public.ensure_property_image_workspace_match() is 'Evita registrar imágenes con workspace distinto al de la propiedad asociada.';
