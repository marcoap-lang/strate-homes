import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildPublicTourUrl } from "@/lib/public-links";
import { getPublicPropertyBySlug, type PublicProperty } from "@/lib/public-properties";

type TourItemRecord = {
  sort_order: number;
  properties?: { slug?: string | null } | Array<{ slug?: string | null }> | null;
};

type TourRecord = {
  id: string;
  slug: string;
  title: string;
  intro_message: string | null;
  workspaces?: { id?: string | null; slug?: string | null; name?: string | null; brand_name?: string | null; public_logo_url?: string | null } | Array<{ id?: string | null; slug?: string | null; name?: string | null; brand_name?: string | null; public_logo_url?: string | null }> | null;
  property_tour_items?: TourItemRecord[] | null;
};

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export type PublicPropertyTour = {
  id: string;
  slug: string;
  title: string;
  introMessage: string | null;
  workspace: {
    id: string | null;
    slug: string;
    name: string;
    brandName: string | null;
    logoUrl: string | null;
  };
  properties: PublicProperty[];
  shareUrl: string;
};

export async function getPublicPropertyTour(workspaceSlug: string, tourSlug: string): Promise<PublicPropertyTour | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("property_tours")
    .select(
      `
        id,
        slug,
        title,
        intro_message,
        workspaces:workspace_id!inner (
          id,
          slug,
          name,
          brand_name,
          public_logo_url
        ),
        property_tour_items (
          sort_order,
          properties:property_id (
            slug
          )
        )
      `,
    )
    .eq("slug", tourSlug)
    .eq("workspaces.slug", workspaceSlug)
    .eq("public_enabled", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const record = data as TourRecord;
  const workspace = firstJoined(record.workspaces);
  if (!workspace?.slug || !workspace.name) return null;

  const propertySlugs = (record.property_tour_items ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => firstJoined(item.properties)?.slug)
    .filter((slug): slug is string => Boolean(slug));

  const properties = (await Promise.all(propertySlugs.map((slug) => getPublicPropertyBySlug(slug, workspace.slug ?? workspaceSlug)))).filter(
    (property): property is PublicProperty => Boolean(property),
  );

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    introMessage: record.intro_message ?? null,
    workspace: {
      id: workspace.id ?? null,
      slug: workspace.slug,
      name: workspace.name,
      brandName: workspace.brand_name ?? null,
      logoUrl: workspace.public_logo_url ?? null,
    },
    properties,
    shareUrl: buildPublicTourUrl(record.slug, workspace.slug),
  };
}
