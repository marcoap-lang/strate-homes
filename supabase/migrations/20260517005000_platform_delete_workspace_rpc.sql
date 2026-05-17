create or replace function public.delete_workspace_as_platform_admin(target_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_workspace public.workspaces%rowtype;
begin
  if not public.is_platform_admin() then
    raise exception 'Only platform admins can delete workspaces.';
  end if;

  select *
    into target_workspace
    from public.workspaces
    where id = target_workspace_id;

  if not found then
    return jsonb_build_object(
      'deleted', false,
      'reason', 'not_found'
    );
  end if;

  delete from public.workspaces
  where id = target_workspace_id;

  if exists (select 1 from public.workspaces where id = target_workspace_id) then
    raise exception 'Workspace delete did not remove the row.';
  end if;

  return jsonb_build_object(
    'deleted', true,
    'id', target_workspace.id,
    'name', coalesce(target_workspace.brand_name, target_workspace.name),
    'slug', target_workspace.slug
  );
end;
$$;

revoke all on function public.delete_workspace_as_platform_admin(uuid) from public;
grant execute on function public.delete_workspace_as_platform_admin(uuid) to authenticated;

comment on function public.delete_workspace_as_platform_admin(uuid) is 'Deletes a workspace and cascaded operational data after verifying platform admin access.';
