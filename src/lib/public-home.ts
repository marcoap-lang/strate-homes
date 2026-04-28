import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProperties, type PublicProperty } from "@/lib/public-properties";

export type PublicAgentCard = {
  id: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
};

export type PublicWorkspaceHome = {
  workspace: {
    id: string;
    name: string;
    slug: string | null;
    brandName: string | null;
    legalName: string | null;
    publicPhone: string | null;
    publicWhatsapp: string | null;
    publicEmail: string | null;
    publicClaim: string | null;
    publicBio: string | null;
    publicLogoUrl: string | null;
    publicHeroUrl: string | null;
  } | null;
  featuredProperties: PublicProperty[];
  recentProperties: PublicProperty[];
  featuredAgents: PublicAgentCard[];
};

export async function getPublicWorkspaceHome(): Promise<PublicWorkspaceHome> {
  const supabase = await createSupabaseServerClient();
  const properties = await getPublicProperties();

  const primaryWorkspaceId = properties[0]?.id
    ? ((await supabase
        .from("properties")
        .select("workspace_id")
        .eq("id", properties[0].id)
        .maybeSingle()).data?.workspace_id as string | undefined)
    : undefined;

  let workspace = null;
  let featuredAgents: PublicAgentCard[] = [];

  if (primaryWorkspaceId) {
    const [{ data: workspaceData }, { data: agentsData }] = await Promise.all([
      supabase.from("workspaces").select("id, name, slug, brand_name, legal_name, public_phone, public_whatsapp, public_email, public_claim, public_bio, public_logo_url, public_hero_url").eq("id", primaryWorkspaceId).maybeSingle(),
      supabase
        .from("agents")
        .select("id, display_name, title, bio, avatar_url, is_public")
        .eq("workspace_id", primaryWorkspaceId)
        .eq("is_active", true)
        .eq("is_public", true)
        .order("updated_at", { ascending: false })
        .limit(3),
    ]);

    workspace = workspaceData
      ? {
          id: workspaceData.id,
          name: workspaceData.name,
          slug: workspaceData.slug ?? null,
          brandName: workspaceData.brand_name ?? null,
          legalName: workspaceData.legal_name ?? null,
          publicPhone: workspaceData.public_phone ?? null,
          publicWhatsapp: workspaceData.public_whatsapp ?? null,
          publicEmail: workspaceData.public_email ?? null,
          publicClaim: workspaceData.public_claim ?? null,
          publicBio: workspaceData.public_bio ?? null,
          publicLogoUrl: workspaceData.public_logo_url ?? null,
          publicHeroUrl: workspaceData.public_hero_url ?? null,
        }
      : null;

    featuredAgents = (agentsData ?? []).map((agent) => ({
      id: agent.id,
      displayName: agent.display_name,
      title: agent.title ?? null,
      bio: agent.bio ?? null,
      avatarUrl: agent.avatar_url ?? null,
      isPublic: agent.is_public ?? false,
    }));
  }

  return {
    workspace,
    featuredProperties: properties.filter((property) => property.priceAmount !== null).slice(0, 3),
    recentProperties: properties.slice(0, 6),
    featuredAgents,
  };
}
