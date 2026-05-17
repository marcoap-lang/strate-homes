import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgentOption, PropertyRecord, StandaloneAgentRecord, TeamMemberRecord } from "@/lib/admin-types";
import { getServerActiveWorkspace } from "@/lib/workspace/server";

export type LeadRecord = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  message: string | null;
  internal_note: string | null;
  status: string;
  source_type: string | null;
  assigned_agent_id: string | null;
  assigned_agent_name: string | null;
  assigned_agent_whatsapp: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  property_title: string | null;
  tasks?: Array<{
    id: string;
    title: string;
    due_at: string | null;
    status: string;
    assigned_agent_id: string | null;
  }>;
  notes?: Array<{
    id: string;
    body: string;
    created_at: string;
    author_name: string | null;
  }>;
  tours?: Array<{ id: string; title: string; slug: string }>;
};

export type PropertyTourRecord = {
  id: string;
  title: string;
  slug: string;
  intro_message: string | null;
  created_at: string;
  public_enabled: boolean;
  lead: { full_name: string | null; phone: string | null } | null;
  properties: Array<{ id: string; title: string; slug: string; sort_order: number }>;
};
export type AdCampaignRequestRecord = {
  id: string;
  objective: string;
  channels: string[];
  monthly_budget_mxn: number | null;
  target_area: string | null;
  status: string;
  created_at: string;
  promoted_property_id: string | null;
  property_title: string | null;
  property_slug: string | null;
  visits_count: number;
  whatsapp_clicks_count: number;
  lead_forms_count: number;
};

type JoinedLeadRecord = {
  id?: string;
  full_name?: string;
  phone?: string;
  email?: string | null;
  message?: string | null;
  internal_note?: string | null;
  status?: string;
  source_type?: string | null;
  source_detail?: string | null;
  landing_path?: string | null;
  assigned_agent_id?: string | null;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
  created_at?: string;
  agents?: { display_name?: string | null; whatsapp?: string | null } | Array<{ display_name?: string | null; whatsapp?: string | null }> | null;
  lead_tasks?: Array<{ id: string; title: string; due_at: string | null; status: string; assigned_agent_id: string | null }>;
  lead_notes?: Array<{
    id: string;
    body: string;
    created_at: string;
    profiles?: { full_name?: string | null } | Array<{ full_name?: string | null }> | null;
  }>;
  property_tours?: Array<{ id: string; title: string; slug: string }>;
};

type LeadPropertyInterestRecord = {
  created_at?: string | null;
  leads?: JoinedLeadRecord | JoinedLeadRecord[] | null;
};

type LeadInterestListItem = LeadPropertyInterestRecord & {
  properties?: { title?: string | null } | Array<{ title?: string | null }> | null;
};

type PropertyTourListItem = {
  id: string;
  title: string;
  slug: string;
  intro_message: string | null;
  created_at: string;
  public_enabled: boolean;
  leads?: { full_name?: string | null; phone?: string | null } | Array<{ full_name?: string | null; phone?: string | null }> | null;
  property_tour_items?: Array<{
    sort_order?: number | null;
    properties?: { id?: string | null; title?: string | null; slug?: string | null } | Array<{ id?: string | null; title?: string | null; slug?: string | null }> | null;
  }> | null;
};

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

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
        publicServices: string | null | undefined;
        publicTrustPoints: string | null | undefined;
        publicAddress: string | null | undefined;
        publicMapsUrl: string | null | undefined;
        publicFacebookUrl: string | null | undefined;
        publicInstagramUrl: string | null | undefined;
        publicGoogleBusinessUrl: string | null | undefined;
        publicPrivacyUrl: string | null | undefined;
      };
      subscription: {
        plan: string;
        status: string;
        trial_ends_at: string | null;
        current_period_ends_at: string | null;
      } | null;
      conversionSummary: {
        events7d: number;
        whatsappClicks7d: number;
        leadForms7d: number;
      };
      properties: PropertyRecord[];
      agents: AgentOption[];
      teamMembers: TeamMemberRecord[];
      standaloneAgents: StandaloneAgentRecord[];
      leads: LeadRecord[];
      tours: PropertyTourRecord[];
      adCampaignRequests: AdCampaignRequestRecord[];
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

  const [
    { data: properties, error: propertiesError },
    { data: agents, error: agentsError },
    { data: teamMembers, error: teamError },
    { data: leads, error: leadsError },
    { data: tours, error: toursError },
    { data: subscription },
    { data: conversionEvents },
    { data: adCampaignRequests },
    { data: adCampaignConversionEvents },
  ] = await Promise.all([
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
            display_name,
            phone,
            whatsapp
          ),
          property_agent_assignments (
            id,
            agent_id,
            agents:agent_id (
              id,
              display_name,
              slug,
              phone,
              whatsapp
            )
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
              source_type,
              assigned_agent_id,
              next_follow_up_at,
              last_contacted_at,
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
            source_type,
            assigned_agent_id,
            next_follow_up_at,
            last_contacted_at,
            created_at,
            agents:assigned_agent_id (
              display_name,
              whatsapp
            ),
            lead_tasks (
              id,
              title,
              due_at,
              status,
              assigned_agent_id
            ),
            lead_notes (
              id,
              body,
              created_at,
              profiles:author_profile_id (
                full_name
              )
            ),
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
    supabase
      .from("property_tours")
      .select(
        `
          id,
          title,
          slug,
          intro_message,
          created_at,
          public_enabled,
          leads:lead_id (
            full_name,
            phone
          ),
          property_tour_items (
            sort_order,
            properties:property_id (
              id,
              title,
              slug
            )
          )
        `,
      )
      .eq("workspace_id", activeWorkspace.workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("workspace_subscriptions")
      .select("plan, status, trial_ends_at, current_period_ends_at")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .maybeSingle(),
    supabase
      .from("public_conversion_events")
      .select("event_type, created_at")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("ad_campaign_requests")
      .select("id, promoted_property_id, objective, channels, monthly_budget_mxn, target_area, status, created_at, properties:promoted_property_id(title, slug)")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("public_conversion_events")
      .select("ad_campaign_request_id, event_type")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .not("ad_campaign_request_id", "is", null),
  ]);

  if (propertiesError) throw propertiesError;
  if (agentsError) throw agentsError;
  if (teamError) throw teamError;

  let leadsData: unknown = leads;
  if (leadsError) {
    const { data: fallbackLeads, error: fallbackLeadsError } = await supabase
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
      .order("created_at", { ascending: false });

    if (fallbackLeadsError) throw leadsError;
    leadsData = fallbackLeads;
  }

  if (toursError) throw toursError;

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

  const normalizedProperties: PropertyRecord[] = (properties ?? []).map((property) => ({
    ...property,
    lead_interests: ((property.lead_property_interests ?? []) as LeadPropertyInterestRecord[])
      .map((interest) => {
        const lead = firstJoined(interest.leads);
        if (!lead?.id || !lead.full_name || !lead.phone || !lead.status || !(interest.created_at ?? lead.created_at)) return null;

        return {
          lead_id: lead.id,
          full_name: lead.full_name,
          phone: lead.phone,
          email: lead.email ?? null,
          status: lead.status,
          created_at: interest.created_at ?? lead.created_at ?? "",
          message: lead.message ?? null,
          internal_note: lead.internal_note ?? null,
        };
      })
      .filter((interest) => interest !== null),
  }));

  const normalizedLeads: LeadRecord[] = ((leadsData ?? []) as LeadInterestListItem[])
    .map((item) => {
      const lead = firstJoined(item.leads);
      const property = firstJoined(item.properties);
      if (!lead?.id || !lead.full_name || !lead.phone || !lead.status || !lead.created_at) return null;

      return {
        id: lead.id,
        full_name: lead.full_name,
        phone: lead.phone,
        email: lead.email ?? null,
        message: lead.message ?? null,
        internal_note: lead.internal_note ?? null,
        status: lead.status,
        source_type: lead.source_type ?? null,
        assigned_agent_id: lead.assigned_agent_id ?? null,
        assigned_agent_name: firstJoined(lead.agents)?.display_name ?? null,
        assigned_agent_whatsapp: firstJoined(lead.agents)?.whatsapp ?? null,
        next_follow_up_at: lead.next_follow_up_at ?? null,
        last_contacted_at: lead.last_contacted_at ?? null,
        created_at: lead.created_at,
        property_title: property?.title ?? null,
        tasks: (lead.lead_tasks ?? [])
          .slice()
          .sort((a, b) => new Date(a.due_at ?? "9999-12-31").getTime() - new Date(b.due_at ?? "9999-12-31").getTime()),
        notes: (lead.lead_notes ?? [])
          .slice()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => ({
            id: note.id,
            body: note.body,
            created_at: note.created_at,
            author_name: firstJoined(note.profiles)?.full_name ?? null,
          })),
        tours: (lead.property_tours ?? []).map((tour) => ({
          id: tour.id,
          title: tour.title,
          slug: tour.slug,
        })),
      };
    })
    .filter((lead) => lead !== null);

  const normalizedTours: PropertyTourRecord[] = ((tours ?? []) as PropertyTourListItem[]).map((tour) => {
    const lead = firstJoined(tour.leads);
    return {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      intro_message: tour.intro_message,
      created_at: tour.created_at,
      public_enabled: tour.public_enabled,
      lead: lead ? { full_name: lead.full_name ?? null, phone: lead.phone ?? null } : null,
      properties: (tour.property_tour_items ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((item) => {
          const property = firstJoined(item.properties);
          if (!property?.id || !property.title || !property.slug) return null;
          return {
            id: property.id,
            title: property.title,
            slug: property.slug,
            sort_order: item.sort_order ?? 0,
          };
        })
        .filter((property) => property !== null),
    };
  });

  const campaignEventCounts = new Map<string, { visits: number; whatsapp: number; leads: number }>();
  (adCampaignConversionEvents ?? []).forEach((event) => {
    if (!event.ad_campaign_request_id) return;
    const current = campaignEventCounts.get(event.ad_campaign_request_id) ?? { visits: 0, whatsapp: 0, leads: 0 };
    if (event.event_type === "property_view") current.visits += 1;
    if (event.event_type === "whatsapp_click") current.whatsapp += 1;
    if (event.event_type === "lead_form_submit") current.leads += 1;
    campaignEventCounts.set(event.ad_campaign_request_id, current);
  });

  const normalizedAdCampaignRequests: AdCampaignRequestRecord[] = ((adCampaignRequests ?? []) as Array<{
    id: string;
    promoted_property_id: string | null;
    objective: string;
    channels: string[] | null;
    monthly_budget_mxn: number | null;
    target_area: string | null;
    status: string;
    created_at: string;
    properties?: { title?: string | null; slug?: string | null } | Array<{ title?: string | null; slug?: string | null }> | null;
  }>).map((request) => {
    const property = firstJoined(request.properties);
    const counts = campaignEventCounts.get(request.id) ?? { visits: 0, whatsapp: 0, leads: 0 };
    return {
      id: request.id,
      objective: request.objective,
      channels: request.channels ?? [],
      monthly_budget_mxn: request.monthly_budget_mxn,
      target_area: request.target_area,
      status: request.status,
      created_at: request.created_at,
      promoted_property_id: request.promoted_property_id ?? null,
      property_title: property?.title ?? null,
      property_slug: property?.slug ?? null,
      visits_count: counts.visits,
      whatsapp_clicks_count: counts.whatsapp,
      lead_forms_count: counts.leads,
    };
  });

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
      publicServices: activeWorkspace.publicServices,
      publicTrustPoints: activeWorkspace.publicTrustPoints,
      publicAddress: activeWorkspace.publicAddress,
      publicMapsUrl: activeWorkspace.publicMapsUrl,
      publicFacebookUrl: activeWorkspace.publicFacebookUrl,
      publicInstagramUrl: activeWorkspace.publicInstagramUrl,
      publicGoogleBusinessUrl: activeWorkspace.publicGoogleBusinessUrl,
      publicPrivacyUrl: activeWorkspace.publicPrivacyUrl,
    },
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          trial_ends_at: subscription.trial_ends_at ?? null,
          current_period_ends_at: subscription.current_period_ends_at ?? null,
        }
      : null,
    conversionSummary: {
      events7d: conversionEvents?.length ?? 0,
      whatsappClicks7d: (conversionEvents ?? []).filter((event) => event.event_type === "whatsapp_click").length,
      leadForms7d: (conversionEvents ?? []).filter((event) => event.event_type === "lead_form_submit").length,
    },
    properties: normalizedProperties,
    agents: agents ?? [],
    teamMembers: normalizedTeamMembers,
    standaloneAgents,
    leads: normalizedLeads,
    tours: normalizedTours,
    adCampaignRequests: normalizedAdCampaignRequests,
  };
}
