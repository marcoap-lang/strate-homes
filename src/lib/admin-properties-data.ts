import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerActiveWorkspace } from "@/lib/workspace/server";

export async function getAdminPropertiesData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Necesitas sesión activa para operar propiedades.");
  }

  const activeWorkspace = await getServerActiveWorkspace(user);

  if (!activeWorkspace?.workspaceId) {
    throw new Error("No hay workspace activo disponible.");
  }

  const [{ data: properties, error: propertiesError }, { data: agents, error: agentsError }] = await Promise.all([
    supabase
      .from("properties")
      .select(
        `
          id,
          title,
          slug,
          property_type,
          status,
          operation_type,
          location_label,
          city,
          state,
          price_amount,
          currency_code,
          public_code,
          description,
          address_line,
          neighborhood,
          country_code,
          bedrooms,
          bathrooms,
          parking_spots,
          lot_area_m2,
          construction_area_m2,
          published_at,
          is_featured,
          created_at,
          updated_at,
          agent_id,
          agents:agent_id (
            id,
            display_name
          ),
          property_images (
            id,
            workspace_id,
            property_id,
            storage_bucket,
            storage_path,
            alt_text,
            sort_order,
            is_cover,
            created_at,
            updated_at
          )
        `,
      )
      .eq("workspace_id", activeWorkspace.workspaceId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("agents")
      .select("id, display_name, slug")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("is_active", true)
      .order("display_name", { ascending: true }),
  ]);

  if (propertiesError) throw propertiesError;
  if (agentsError) throw agentsError;

  return {
    activeWorkspace,
    properties: properties ?? [],
    agents: agents ?? [],
  };
}
