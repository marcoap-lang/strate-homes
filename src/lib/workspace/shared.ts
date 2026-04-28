export type WorkspaceRole = "owner" | "admin" | "agent" | "staff";

export type WorkspaceMembershipSummary = {
  workspaceId: string | null;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  brandName?: string | null;
  publicPhone?: string | null;
  publicWhatsapp?: string | null;
  publicEmail?: string | null;
  publicClaim?: string | null;
  publicBio?: string | null;
  publicLogoUrl?: string | null;
  publicHeroUrl?: string | null;
  role?: WorkspaceRole | null;
};

export type ActiveWorkspace = WorkspaceMembershipSummary & {
  profileId: string;
};

export const ACTIVE_WORKSPACE_STORAGE_KEY = "strate-homes.active-workspace-id";
