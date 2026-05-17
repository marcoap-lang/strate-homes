import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ACTIVE_WORKSPACE_STORAGE_KEY, type WorkspaceMembershipSummary } from "@/lib/workspace/shared";

function getWorkspaceMeta(workspaces: unknown) {
  if (Array.isArray(workspaces)) {
    return workspaces[0] as {
      name?: string | null;
      slug?: string | null;
      brand_name?: string | null;
      public_phone?: string | null;
      public_whatsapp?: string | null;
      public_email?: string | null;
      public_claim?: string | null;
      public_bio?: string | null;
      public_logo_url?: string | null;
      public_hero_url?: string | null;
      public_services?: string | null;
      public_trust_points?: string | null;
      public_address?: string | null;
      public_maps_url?: string | null;
      public_facebook_url?: string | null;
      public_instagram_url?: string | null;
      public_google_business_url?: string | null;
      public_privacy_url?: string | null;
    } | undefined;
  }

  return (workspaces as {
    name?: string | null;
    slug?: string | null;
    brand_name?: string | null;
    public_phone?: string | null;
    public_whatsapp?: string | null;
    public_email?: string | null;
    public_claim?: string | null;
    public_bio?: string | null;
    public_logo_url?: string | null;
    public_hero_url?: string | null;
    public_services?: string | null;
    public_trust_points?: string | null;
    public_address?: string | null;
    public_maps_url?: string | null;
    public_facebook_url?: string | null;
    public_instagram_url?: string | null;
    public_google_business_url?: string | null;
    public_privacy_url?: string | null;
  } | null) ?? undefined;
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
          slug,
          brand_name,
          public_phone,
          public_whatsapp,
          public_email,
          public_claim,
          public_bio,
          public_logo_url,
          public_hero_url,
          public_services,
          public_trust_points,
          public_address,
          public_maps_url,
          public_facebook_url,
          public_instagram_url,
          public_google_business_url,
          public_privacy_url
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
      brandName: workspaceMeta?.brand_name ?? null,
      publicPhone: workspaceMeta?.public_phone ?? null,
      publicWhatsapp: workspaceMeta?.public_whatsapp ?? null,
      publicEmail: workspaceMeta?.public_email ?? null,
      publicClaim: workspaceMeta?.public_claim ?? null,
      publicBio: workspaceMeta?.public_bio ?? null,
      publicLogoUrl: workspaceMeta?.public_logo_url ?? null,
      publicHeroUrl: workspaceMeta?.public_hero_url ?? null,
      publicServices: workspaceMeta?.public_services ?? null,
      publicTrustPoints: workspaceMeta?.public_trust_points ?? null,
      publicAddress: workspaceMeta?.public_address ?? null,
      publicMapsUrl: workspaceMeta?.public_maps_url ?? null,
      publicFacebookUrl: workspaceMeta?.public_facebook_url ?? null,
      publicInstagramUrl: workspaceMeta?.public_instagram_url ?? null,
      publicGoogleBusinessUrl: workspaceMeta?.public_google_business_url ?? null,
      publicPrivacyUrl: workspaceMeta?.public_privacy_url ?? null,
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
    brandName: selectedMembership?.brandName ?? null,
    publicPhone: selectedMembership?.publicPhone ?? null,
    publicWhatsapp: selectedMembership?.publicWhatsapp ?? null,
    publicEmail: selectedMembership?.publicEmail ?? null,
    publicClaim: selectedMembership?.publicClaim ?? null,
    publicBio: selectedMembership?.publicBio ?? null,
    publicLogoUrl: selectedMembership?.publicLogoUrl ?? null,
    publicHeroUrl: selectedMembership?.publicHeroUrl ?? null,
    publicServices: selectedMembership?.publicServices ?? null,
    publicTrustPoints: selectedMembership?.publicTrustPoints ?? null,
    publicAddress: selectedMembership?.publicAddress ?? null,
    publicMapsUrl: selectedMembership?.publicMapsUrl ?? null,
    publicFacebookUrl: selectedMembership?.publicFacebookUrl ?? null,
    publicInstagramUrl: selectedMembership?.publicInstagramUrl ?? null,
    publicGoogleBusinessUrl: selectedMembership?.publicGoogleBusinessUrl ?? null,
    publicPrivacyUrl: selectedMembership?.publicPrivacyUrl ?? null,
    role: selectedMembership?.role ?? null,
    memberships,
  };
}
