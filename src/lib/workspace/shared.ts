export type WorkspaceRole = "owner" | "admin" | "agent" | "staff";

export type WorkspaceMembershipSummary = {
  workspaceId: string | null;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  role?: WorkspaceRole | null;
};

export type ActiveWorkspace = WorkspaceMembershipSummary & {
  profileId: string;
};

export const ACTIVE_WORKSPACE_STORAGE_KEY = "strate-homes.active-workspace-id";
