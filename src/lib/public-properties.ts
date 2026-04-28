import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicProperty = {
  id: string;
  slug: string;
  title: string;
  workspaceSlug: string | null;
  workspaceName: string | null;
  workspaceBrandName: string | null;
  locationLabel: string;
  city: string | null;
  state: string | null;
  operationType: string;
  status: string;
  currencyCode: string;
  priceAmount: number | null;
  description: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  constructionAreaM2: number | null;
  neighborhood: string | null;
  publicCode: string | null;
  coverImageUrl: string | null;
  images: Array<{
    id: string;
    url: string | null;
    altText: string | null;
    isCover: boolean;
    sortOrder: number;
  }>;
  agent: {
    id: string;
    slug: string | null;
    displayName: string;
    title: string | null;
    bio: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatarUrl: string | null;
  } | null;
  workspaceContactAgent: {
    id: string;
    displayName: string;
    phone: string | null;
    whatsapp: string | null;
  } | null;
};

export type PublicPropertyFilters = {
  workspaceSlug?: string | null;
  operation?: string | null;
  location?: string | null;
  type?: string | null;
  price?: string | null;
  bedrooms?: string | null;
};

const demoImageCatalog: Record<string, string> = {
  fachada: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
  portada: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  sala: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  comedor: "https://images.unsplash.com/photo-1616594039964-3d1b5c6c0b2c?auto=format&fit=crop&w=1600&q=80",
  cocina: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  "recamara-principal": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  "bano-principal": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1600&q=80",
  terraza: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  patio: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
  vista: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  amenidad: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
  rooftop: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  acceso: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
  interior: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  consultorio: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
};

function buildStorageUrl(path: string) {
  if (path.startsWith("demo/")) {
    const fileName = path.split("/").pop()?.replace(".jpg", "") ?? "portada";
    const key = Object.keys(demoImageCatalog).find((entry) => fileName.includes(entry)) ?? "portada";
    return demoImageCatalog[key];
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/property-images/${path}`;
}

function extractWorkspaceContactAgent(record: any) {
  const workspaceJoin = Array.isArray(record.workspace_contact_agents)
    ? record.workspace_contact_agents[0]
    : record.workspace_contact_agents;
  const nestedAgents = workspaceJoin?.agents;
  const agents = Array.isArray(nestedAgents) ? nestedAgents : nestedAgents ? [nestedAgents] : [];

  return (
    agents.find((agent: any) => agent?.is_public && agent?.is_active && (agent?.whatsapp || agent?.phone)) ?? null
  );
}

function mapPublicProperty(record: any): PublicProperty {
  const images = (record.property_images ?? [])
    .slice()
    .sort((a: any, b: any) => {
      if (a.is_cover === b.is_cover) return a.sort_order - b.sort_order;
      return a.is_cover ? -1 : 1;
    })
    .map((image: any) => ({
      id: image.id,
      url: buildStorageUrl(image.storage_path),
      altText: image.alt_text ?? null,
      isCover: image.is_cover,
      sortOrder: image.sort_order,
    }));

  const coverImage = images.find((image: { isCover: boolean }) => image.isCover) ?? images[0] ?? null;
  const agent = Array.isArray(record.agents) ? record.agents[0] : record.agents;
  const workspace = Array.isArray(record.workspaces) ? record.workspaces[0] : record.workspaces;
  const workspaceContactAgent = extractWorkspaceContactAgent(record);

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    workspaceSlug: workspace?.slug ?? null,
    workspaceName: workspace?.name ?? null,
    workspaceBrandName: workspace?.brand_name ?? null,
    locationLabel: record.location_label,
    city: record.city ?? null,
    state: record.state ?? null,
    operationType: record.operation_type,
    status: record.status,
    currencyCode: record.currency_code,
    priceAmount: record.price_amount ?? null,
    description: record.description ?? null,
    bedrooms: record.bedrooms ?? null,
    bathrooms: record.bathrooms ?? null,
    propertyType: record.property_type ?? null,
    constructionAreaM2: record.construction_area_m2 ?? null,
    neighborhood: record.neighborhood ?? null,
    publicCode: record.public_code ?? null,
    coverImageUrl: coverImage?.url ?? null,
    images,
    agent: agent
      ? {
          id: agent.id,
          slug: agent.slug ?? null,
          displayName: agent.display_name,
          title: agent.title ?? null,
          bio: agent.bio ?? null,
          phone: agent.phone ?? null,
          whatsapp: agent.whatsapp ?? null,
          avatarUrl: agent.avatar_url ?? null,
        }
      : null,
    workspaceContactAgent: workspaceContactAgent
      ? {
          id: workspaceContactAgent.id,
          displayName: workspaceContactAgent.display_name,
          phone: workspaceContactAgent.phone ?? null,
          whatsapp: workspaceContactAgent.whatsapp ?? null,
        }
      : null,
  };
}

function applyPriceFilter(query: any, price: string | null | undefined) {
  if (!price) return query;
  if (price === "under-1m") return query.lt("price_amount", 1000000);
  if (price === "1m-3m") return query.gte("price_amount", 1000000).lt("price_amount", 3000000);
  if (price === "3m-plus") return query.gte("price_amount", 3000000);
  return query;
}

function applyBedroomsFilter(query: any, bedrooms: string | null | undefined) {
  if (!bedrooms) return query;
  const parsed = Number.parseInt(bedrooms, 10);
  if (Number.isNaN(parsed)) return query;
  return query.gte("bedrooms", parsed);
}

const publicPropertySelect = `
  id,
  slug,
  title,
  location_label,
  city,
  state,
  operation_type,
  status,
  property_type,
  currency_code,
  price_amount,
  description,
  bedrooms,
  bathrooms,
  construction_area_m2,
  neighborhood,
  public_code,
  published_at,
  is_featured,
  workspaces:workspace_id (
    slug,
    name,
    brand_name
  ),
  agents:agent_id (
    id,
    slug,
    display_name,
    title,
    bio,
    phone,
    whatsapp,
    avatar_url
  ),
  workspace_contact_agents:workspace_id (
    agents (
      id,
      display_name,
      phone,
      whatsapp,
      is_public,
      is_active,
      updated_at
    )
  ),
  property_images (
    id,
    storage_path,
    alt_text,
    sort_order,
    is_cover
  )
`;

export async function getPublicProperties(filters: PublicPropertyFilters = {}) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("properties")
    .select(publicPropertySelect)
    .eq("status", "active")
    .not("published_at", "is", null);

  if (filters.workspaceSlug) query = query.eq("workspaces.slug", filters.workspaceSlug);
  if (filters.operation) query = query.eq("operation_type", filters.operation);
  if (filters.type) query = query.eq("property_type", filters.type);
  if (filters.location) query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,location_label.ilike.%${filters.location}%`);
  query = applyPriceFilter(query, filters.price);
  query = applyBedroomsFilter(query, filters.bedrooms);

  const { data, error } = await query.order("is_featured", { ascending: false }).order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPublicProperty);
}

export async function getPublicPropertyBySlug(slug: string, workspaceSlug?: string | null) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("properties")
    .select(publicPropertySelect)
    .eq("slug", slug)
    .eq("status", "active")
    .not("published_at", "is", null);

  if (workspaceSlug) query = query.eq("workspaces.slug", workspaceSlug);

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapPublicProperty(data);
}
