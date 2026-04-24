import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicProperty = {
  id: string;
  slug: string;
  title: string;
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
  constructionAreaM2: number | null;
  neighborhood: string | null;
  publicCode: string | null;
  coverImageUrl: string | null;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    isCover: boolean;
    sortOrder: number;
  }>;
  agent: { id: string; displayName: string } | null;
};

function buildStorageUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/property-images/${path}`;
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

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
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
    constructionAreaM2: record.construction_area_m2 ?? null,
    neighborhood: record.neighborhood ?? null,
    publicCode: record.public_code ?? null,
    coverImageUrl: coverImage?.url ?? null,
    images,
    agent: agent ? { id: agent.id, displayName: agent.display_name } : null,
  };
}

export async function getPublicProperties() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
        id,
        slug,
        title,
        location_label,
        city,
        state,
        operation_type,
        status,
        currency_code,
        price_amount,
        description,
        bedrooms,
        bathrooms,
        construction_area_m2,
        neighborhood,
        public_code,
        published_at,
        agents:agent_id (
          id,
          display_name
        ),
        property_images (
          id,
          storage_path,
          alt_text,
          sort_order,
          is_cover
        )
      `,
    )
    .eq("status", "active")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapPublicProperty);
}

export async function getPublicPropertyBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
        id,
        slug,
        title,
        location_label,
        city,
        state,
        operation_type,
        status,
        currency_code,
        price_amount,
        description,
        bedrooms,
        bathrooms,
        construction_area_m2,
        neighborhood,
        public_code,
        published_at,
        agents:agent_id (
          id,
          display_name
        ),
        property_images (
          id,
          storage_path,
          alt_text,
          sort_order,
          is_cover
        )
      `,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapPublicProperty(data);
}
