import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildWhatsAppPropertyMessage, buildPublicPropertyUrl } from "@/lib/public-links";
import { getPublicProperties, type PublicProperty } from "@/lib/public-properties";

export type PublicAgentProfile = {
  id: string;
  slug: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  workspace: {
    id: string;
    slug: string | null;
    name: string;
    brandName: string | null;
  };
  properties: PublicProperty[];
  whatsappUrl: string | null;
};

export async function getPublicAgentBySlug(workspaceSlug: string, agentSlug: string): Promise<PublicAgentProfile | null> {
  const supabase = await createSupabaseServerClient();

  const { data: agent, error } = await supabase
    .from("agents")
    .select(
      `
        id,
        slug,
        display_name,
        title,
        bio,
        avatar_url,
        phone,
        whatsapp,
        email,
        workspace_id,
        workspaces:workspace_id (
          id,
          slug,
          name,
          brand_name
        )
      `,
    )
    .eq("slug", agentSlug)
    .eq("is_active", true)
    .eq("is_public", true)
    .eq("workspaces.slug", workspaceSlug)
    .maybeSingle();

  if (error) throw error;
  if (!agent) return null;

  const workspace = Array.isArray(agent.workspaces) ? agent.workspaces[0] : agent.workspaces;
  if (!workspace) return null;

  const allWorkspaceProperties = await getPublicProperties({ workspaceSlug });
  const properties = allWorkspaceProperties.filter((property) => property.agent?.id === agent.id);

  const propertyUrl = buildPublicPropertyUrl(properties[0]?.slug ?? "", workspace.slug ?? workspaceSlug);
  const whatsappNumber = (agent.whatsapp ?? agent.phone ?? "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        buildWhatsAppPropertyMessage({
          title: properties[0]?.title ?? `asesoría con ${agent.display_name}`,
          locationLabel: properties[0]?.locationLabel ?? workspace.brand_name ?? workspace.name,
          priceLabel: properties[0]?.priceAmount ? `${properties[0].currencyCode} ${properties[0].priceAmount.toLocaleString("es-MX")}` : "Consultar",
          propertyUrl,
        }),
      )}`
    : null;

  return {
    id: agent.id,
    slug: agent.slug,
    displayName: agent.display_name,
    title: agent.title ?? null,
    bio: agent.bio ?? null,
    avatarUrl: agent.avatar_url ?? null,
    phone: agent.phone ?? null,
    whatsapp: agent.whatsapp ?? null,
    email: agent.email ?? null,
    workspace: {
      id: workspace.id,
      slug: workspace.slug ?? null,
      name: workspace.name,
      brandName: workspace.brand_name ?? null,
    },
    properties,
    whatsappUrl,
  };
}
