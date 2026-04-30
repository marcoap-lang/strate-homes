import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgentOption, PropertyRecord, StandaloneAgentRecord, TeamMemberRecord } from "@/lib/admin-types";

type LeadRecord = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  internal_note: string | null;
  status: string;
  created_at: string;
  property_title: string | null;
  tours?: Array<{ id: string; title: string; slug: string }>;
};
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
        brandName: string | null | undefined;
        publicPhone: string | null | undefined;
        publicWhatsapp: string | null | undefined;
        publicEmail: string | null | undefined;
        publicClaim: string | null | undefined;
        publicBio: string | null | undefined;
        publicLogoUrl: string | null | undefined;
        publicHeroUrl: string | null | undefined;
      };
      properties: PropertyRecord[];
      agents: AgentOption[];
      teamMembers: TeamMemberRecord[];
      standaloneAgents: StandaloneAgentRecord[];
      leads: LeadRecord[];
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

  const [{ data: properties, error: propertiesError }, { data: agents, error: agentsError }, { data: teamMembers, error: teamError }, { data: leads, error: leadsError }] = await Promise.all([
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
          short_description,
          amenities,
          extra_features,
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
          ),
          lead_property_interests (
            created_at,
            leads:lead_id (
              id,
              full_name,
              phone,
              email,
              message,
              internal_note,
              status,
              created_at
            )
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
    supabase
      .from("lead_property_interests")
      .select(
        `
          created_at,
          leads:lead_id (
            id,
            full_name,
            phone,
            email,
            message,
            internal_note,
            status,
            created_at,
            property_tours (
              id,
              title,
              slug
            )
          ),
          properties:property_id (
            title
          )
        `,
      )
      .eq("workspace_id", activeWorkspace.workspaceId)
      .order("created_at", { ascending: false }),
  ]);

  if (propertiesError) throw propertiesError;
  if (agentsError) throw agentsError;
  if (teamError) throw teamError;
  if (leadsError) throw leadsError;

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

  const normalizedProperties: PropertyRecord[] = (properties ?? []).map((property: any) => ({
    ...property,
    lead_interests: (property.lead_property_interests ?? []).map((interest: any) => {
      const lead = Array.isArray(interest.leads) ? interest.leads[0] : interest.leads;
      return {
        lead_id: lead?.id,
        full_name: lead?.full_name,
        phone: lead?.phone,
        email: lead?.email ?? null,
        status: lead?.status,
        created_at: interest.created_at ?? lead?.created_at,
        message: lead?.message ?? null,
        internal_note: lead?.internal_note ?? null,
      };
    }),
  }));

  return {
    kind: "ready",
    activeWorkspace: {
      workspaceId: activeWorkspace.workspaceId,
      workspaceName: activeWorkspace.workspaceName,
      workspaceSlug: activeWorkspace.workspaceSlug,
      brandName: activeWorkspace.brandName,
      publicPhone: activeWorkspace.publicPhone,
      publicWhatsapp: activeWorkspace.publicWhatsapp,
      publicEmail: activeWorkspace.publicEmail,
      publicClaim: activeWorkspace.publicClaim,
      publicBio: activeWorkspace.publicBio,
      publicLogoUrl: activeWorkspace.publicLogoUrl,
      publicHeroUrl: activeWorkspace.publicHeroUrl,
    },
    properties: normalizedProperties,
    agents: agents ?? [],
    teamMembers: normalizedTeamMembers,
    standaloneAgents,
    leads: (leads ?? []).map((item: any) => ({
      id: Array.isArray(item.leads) ? item.leads[0]?.id : item.leads?.id,
      full_name: Array.isArray(item.leads) ? item.leads[0]?.full_name : item.leads?.full_name,
      phone: Array.isArray(item.leads) ? item.leads[0]?.phone : item.leads?.phone,
      email: Array.isArray(item.leads) ? item.leads[0]?.email ?? null : item.leads?.email ?? null,
      message: Array.isArray(item.leads) ? item.leads[0]?.message ?? null : item.leads?.message ?? null,
      internal_note: Array.isArray(item.leads) ? item.leads[0]?.internal_note ?? null : item.leads?.internal_note ?? null,
      status: Array.isArray(item.leads) ? item.leads[0]?.status : item.leads?.status,
      created_at: Array.isArray(item.leads) ? item.leads[0]?.created_at : item.leads?.created_at,
      property_title: Array.isArray(item.properties) ? item.properties[0]?.title ?? null : item.properties?.title ?? null,
      tours: (Array.isArray(item.leads) ? item.leads[0]?.property_tours : item.leads?.property_tours ?? []).map((tour: any) => ({
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
      })),
    })),
  };
}
