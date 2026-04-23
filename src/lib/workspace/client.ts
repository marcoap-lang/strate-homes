import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ACTIVE_WORKSPACE_STORAGE_KEY } from "@/lib/workspace/shared";

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

export async function getClientActiveWorkspace(userId: string) {
  const supabase = createSupabaseBrowserClient();
  const storedWorkspaceId = getClientStoredWorkspaceId();

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

  const selectedMembership =
    memberships?.find((membership) => membership.workspace_id === storedWorkspaceId) ?? memberships?.[0] ?? null;

  const workspaceMeta = getWorkspaceMeta(selectedMembership?.workspaces);

  return {
    workspaceId: selectedMembership?.workspace_id ?? null,
    workspaceName: workspaceMeta?.name ?? null,
    workspaceSlug: workspaceMeta?.slug ?? null,
    role: selectedMembership?.role ?? null,
  };
}
