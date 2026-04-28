import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgentOption, PropertyRecord, StandaloneAgentRecord, TeamMemberRecord } from "@/lib/admin-types";
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
        workspaceSlug: string | null | undefined;
      };
      properties: PropertyRecord[];
      agents: AgentOption[];
      teamMembers: TeamMemberRecord[];
      standaloneAgents: StandaloneAgentRecord[];
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

  const [{ data: properties, error: propertiesError }, { data: agents, error: agentsError }, { data: teamMembers, error: teamError }] = await Promise.all([
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
      .select("id, profile_id, display_name, slug, title, bio, phone, email, whatsapp, avatar_url, is_public")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("is_active", true)
      .order("display_name", { ascending: true }),
    supabase
      .from("workspace_members")
      .select(
        `
          id,
          profile_id,
          role,
          is_active,
          joined_at,
          profiles:profile_id (
            full_name,
            email,
            phone,
            avatar_url
          )
        `,
      )
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
  ]);

  if (propertiesError) throw propertiesError;
  if (agentsError) throw agentsError;
  if (teamError) throw teamError;

  const agentByProfileId = new Map(
    (agents ?? [])
      .filter((agent) => agent.profile_id)
      .map((agent) => [agent.profile_id as string, agent]),
  );

  const normalizedTeamMembers: TeamMemberRecord[] = (teamMembers ?? []).map((member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    const linkedAgent = agentByProfileId.get(member.profile_id);

    return {
      membership_id: member.id,
      profile_id: member.profile_id,
      workspace_role: member.role,
      is_active: member.is_active,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      avatar_url: profile?.avatar_url ?? null,
      joined_at: member.joined_at ?? null,
      agent_profile: linkedAgent
        ? {
            id: linkedAgent.id,
            display_name: linkedAgent.display_name,
            slug: linkedAgent.slug,
            title: linkedAgent.title ?? null,
            bio: linkedAgent.bio ?? null,
            phone: linkedAgent.phone ?? null,
            email: linkedAgent.email ?? null,
            whatsapp: linkedAgent.whatsapp ?? null,
            avatar_url: linkedAgent.avatar_url ?? null,
            is_public: linkedAgent.is_public ?? false,
            is_active: true,
          }
        : null,
    };
  });

  const memberProfileIds = new Set(normalizedTeamMembers.map((member) => member.profile_id));
  const standaloneAgents: StandaloneAgentRecord[] = (agents ?? [])
    .filter((agent) => !agent.profile_id || !memberProfileIds.has(agent.profile_id))
    .map((agent) => ({
      id: agent.id,
      display_name: agent.display_name,
      slug: agent.slug,
      title: agent.title ?? null,
      bio: agent.bio ?? null,
      phone: agent.phone ?? null,
      email: agent.email ?? null,
      whatsapp: agent.whatsapp ?? null,
      avatar_url: agent.avatar_url ?? null,
      is_public: agent.is_public ?? false,
      is_active: true,
      profile_id: agent.profile_id ?? null,
    }));

  return {
    kind: "ready",
    activeWorkspace: {
      workspaceId: activeWorkspace.workspaceId,
      workspaceName: activeWorkspace.workspaceName,
      workspaceSlug: activeWorkspace.workspaceSlug,
    },
    properties: properties ?? [],
    agents: agents ?? [],
    teamMembers: normalizedTeamMembers,
    standaloneAgents,
  };
}
