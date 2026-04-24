create or replace function public.bootstrap_initial_workspace(
  input_workspace_name text,
  input_workspace_slug text default null
)
returns table (
  workspace_id uuid,
  created_workspace_name text,
  created_workspace_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := btrim(coalesce(input_workspace_name, ''));
  normalized_slug text := nullif(
    regexp_replace(
      lower(trim(coalesce(input_workspace_slug, ''))),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    ''
  );
  existing_active_memberships integer := 0;
  created_workspace public.workspaces%rowtype;
begin
  if current_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication_required';
  end if;

  if char_length(normalized_name) < 3 then
    raise exception using
      errcode = '22023',
      message = 'invalid_workspace_name';
  end if;

  normalized_slug := regexp_replace(coalesce(normalized_slug, lower(normalized_name)), '(^-|-$)', '', 'g');

  if normalized_slug is null or char_length(normalized_slug) < 3 then
    raise exception using
      errcode = '22023',
      message = 'invalid_workspace_slug';
  end if;

  perform 1
  from public.profiles p
  where p.id = current_user_id
    and p.is_active = true
  for update;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'profile_not_ready';
  end if;

  select count(*)::integer
  into existing_active_memberships
  from public.workspace_members wm
  where wm.profile_id = current_user_id
    and wm.is_active = true;

  if existing_active_memberships > 0 then
    raise exception using
      errcode = '23505',
      message = 'active_membership_exists';
  end if;

  insert into public.workspaces (
    name,
    slug,
    brand_name
  )
  values (
    normalized_name,
    normalized_slug,
    normalized_name
  )
  returning * into created_workspace;

  insert into public.workspace_members (
    workspace_id,
    profile_id,
    role,
    is_active,
    invited_by,
    joined_at
  )
  values (
    created_workspace.id,
    current_user_id,
    'owner',
    true,
    current_user_id,
    timezone('utc', now())
  );

  update public.profiles
  set
    default_workspace_id = created_workspace.id,
    updated_at = timezone('utc', now())
  where id = current_user_id;

  return query
  select created_workspace.id, created_workspace.name, created_workspace.slug;
end;
$$;

revoke all on function public.bootstrap_initial_workspace(text, text) from public;
grant execute on function public.bootstrap_initial_workspace(text, text) to authenticated;

comment on function public.bootstrap_initial_workspace(text, text) is 'Bootstrap seguro del primer workspace: crea workspace, membership owner y default_workspace_id solo para el usuario autenticado sin memberships activas.';
