import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ACTIVE_WORKSPACE_STORAGE_KEY, type WorkspaceMembershipSummary } from "@/lib/workspace/shared";

function getWorkspaceMeta(workspaces: unknown) {
  if (Array.isArray(workspaces)) {
    return workspaces[0] as { name?: string | null; slug?: string | null } | undefined;
  }

  return (workspaces as { name?: string | null; slug?: string | null } | null) ?? undefined;
}

export function getClientStoredWorkspaceId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
}

export function setClientStoredWorkspaceId(workspaceId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
}

export function clearClientStoredWorkspaceId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
}

export async function getClientWorkspaceMemberships(userId: string): Promise<WorkspaceMembershipSummary[]> {
  const supabase = createSupabaseBrowserClient();

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
    .eq("profile_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (memberships ?? []).map((membership) => {
    const workspaceMeta = getWorkspaceMeta(membership.workspaces);

    return {
      workspaceId: membership.workspace_id,
      workspaceName: workspaceMeta?.name ?? null,
      workspaceSlug: workspaceMeta?.slug ?? null,
      role: membership.role ?? null,
    };
  });
}

export async function getClientActiveWorkspace(userId: string) {
  const storedWorkspaceId = getClientStoredWorkspaceId();
  const memberships = await getClientWorkspaceMemberships(userId);

  const selectedMembership = memberships.find((membership) => membership.workspaceId === storedWorkspaceId) ?? memberships[0] ?? null;

  return {
    workspaceId: selectedMembership?.workspaceId ?? null,
    workspaceName: selectedMembership?.workspaceName ?? null,
    workspaceSlug: selectedMembership?.workspaceSlug ?? null,
    role: selectedMembership?.role ?? null,
    memberships,
  };
}
