import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActiveWorkspace } from "@/lib/workspace/shared";

function getWorkspaceMeta(workspaces: unknown) {
  if (Array.isArray(workspaces)) {
    return workspaces[0] as { name?: string | null; slug?: string | null } | undefined;
  }

  return (workspaces as { name?: string | null; slug?: string | null } | null) ?? undefined;
}

export async function getServerActiveWorkspace(user: User | null): Promise<ActiveWorkspace | null> {
  if (!user) return null;

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, default_workspace_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      profileId: user.id,
      workspaceId: null,
    };
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select(
      `
        workspace_id,
        role,
        is_active,
        workspaces:workspace_id (
          name,
          slug
        )
      `,
    )
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const preferredMembership =
    memberships?.find((membership) => membership.workspace_id === profile.default_workspace_id) ?? memberships?.[0] ?? null;

  const workspaceMeta = getWorkspaceMeta(preferredMembership?.workspaces);

  return {
    profileId: profile.id,
    workspaceId: preferredMembership?.workspace_id ?? profile.default_workspace_id ?? null,
    workspaceName: workspaceMeta?.name ?? null,
    workspaceSlug: workspaceMeta?.slug ?? null,
    role: preferredMembership?.role ?? null,
  };
}
