export type WorkspaceRole = "owner" | "admin" | "agent" | "staff";

export type ActiveWorkspace = {
  profileId: string;
  workspaceId: string | null;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  role?: WorkspaceRole | null;
};

export const ACTIVE_WORKSPACE_STORAGE_KEY = "strate-homes.active-workspace-id";
