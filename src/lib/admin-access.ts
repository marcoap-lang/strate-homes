import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgentOption, PropertyRecord } from "@/lib/admin-types";
import { getServerActiveWorkspace } from "@/lib/workspace/server";

export type AdminAccessState =
  | {
      kind: "no-session";
    }
  | {
      kind: "ready";
      activeWorkspace: {
        workspaceId: string;
        workspaceName: string | null | undefined;
      };
      properties: PropertyRecord[];
      agents: AgentOption[];
    }
  | {
      kind: "first-access" | "no-workspace";
      user: {
        id: string;
        email: string | null;
        fullName: string | null;
      };
      membershipsCount: number;
    };

export async function getAdminAccessState(): Promise<AdminAccessState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "no-session" };
  }

  const [{ data: profile }, { count: membershipsCount }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, default_workspace_id").eq("id", user.id).maybeSingle(),
    supabase.from("workspace_members").select("id", { count: "exact", head: true }).eq("profile_id", user.id).eq("is_active", true),
  ]);

  const activeWorkspace = await getServerActiveWorkspace(user);

  if (!activeWorkspace?.workspaceId) {
    return {
      kind: (membershipsCount ?? 0) === 0 ? "first-access" : "no-workspace",
      user: {
        id: user.id,
        email: user.email ?? profile?.email ?? null,
        fullName: profile?.full_name ?? null,
      },
      membershipsCount: membershipsCount ?? 0,
    };
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
          created_by,
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
    kind: "ready",
    activeWorkspace: {
      workspaceId: activeWorkspace.workspaceId,
      workspaceName: activeWorkspace.workspaceName,
    },
    properties: properties ?? [],
    agents: agents ?? [],
  };
}
