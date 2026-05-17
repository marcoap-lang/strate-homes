import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBaseUrl } from "@/lib/public-links";

export type PlatformPlan = "solo" | "small_agency" | "agency";
export type PlatformSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";
export type PlatformCommercialStatus = "prospect" | "demo" | "customer" | "risk" | "churn";

export type PlatformSubscription = {
  workspace_id: string;
  plan: PlatformPlan;
  status: PlatformSubscriptionStatus;
  commercial_status: PlatformCommercialStatus;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
  external_customer_id: string | null;
};

export type PlatformWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  brand_name: string | null;
  public_logo_url: string | null;
  public_whatsapp: string | null;
  is_active: boolean;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  users_count: number;
  agents_count: number;
  properties_count: number;
  published_count: number;
  leads_count: number;
  no_cover_count: number;
  no_agent_count: number;
  agents_without_whatsapp_count: number;
  stale_leads_count: number;
  open_followups_count: number;
  last_activity_at: string | null;
  health_score: number;
  subscription: PlatformSubscription | null;
  alerts: string[];
  public_url: string;
};

export type PlatformActivityEvent = {
  id: string;
  workspace_id: string | null;
  workspace_name: string | null;
  actor_name: string | null;
  actor_email: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type PlatformMember = {
  membership_id: string;
  profile_id: string;
  role: string;
  is_active: boolean;
  full_name: string | null;
  email: string | null;
  joined_at: string | null;
};

export type PlatformAgent = {
  id: string;
  display_name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_public: boolean;
  is_active: boolean;
};

export type PlatformProperty = {
  id: string;
  title: string;
  slug: string;
  status: string;
  agent_id: string | null;
  agent_name: string | null;
  price_amount: number | null;
  currency_code: string;
  location_label: string | null;
  created_at: string;
  updated_at: string;
  images_count: number;
  has_cover: boolean;
};

export type PlatformLead = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  status: string;
  source_type: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  assigned_agent_name: string | null;
};

export type PlatformNote = {
  id: string;
  body: string;
  created_at: string;
  author_name: string | null;
  author_email: string | null;
};

export type PlatformFollowup = {
  id: string;
  title: string;
  due_at: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  assigned_name: string | null;
  assigned_email: string | null;
};

export type PlatformAdCampaignRequest = {
  id: string;
  workspace_id: string;
  workspace_name: string | null;
  workspace_slug: string | null;
  requested_by_email: string | null;
  objective: string;
  channels: string[];
  monthly_budget_mxn: number | null;
  target_area: string | null;
  property_title: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export type PlatformFeatureFlag = {
  workspace_id: string;
  flag_key: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
  updated_at: string;
};

export type PlatformAnnouncement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type PlatformAdminState =
  | { kind: "no-session" }
  | { kind: "forbidden"; email: string | null }
  | {
      kind: "ready";
      totals: {
        workspaces: number;
        activeWorkspaces: number;
        users: number;
        properties: number;
        publishedProperties: number;
        leads: number;
        recentEvents: number;
        openFollowups: number;
        staleAccounts: number;
        conversions7d: number;
        whatsappClicks7d: number;
        adRequests: number;
      };
      salesPipeline: Record<PlatformCommercialStatus, number>;
      workspaces: PlatformWorkspaceRow[];
      activity: PlatformActivityEvent[];
      announcements: PlatformAnnouncement[];
      adCampaignRequests: PlatformAdCampaignRequest[];
    };

export type PlatformWorkspaceDetailState =
  | { kind: "no-session" }
  | { kind: "forbidden"; email: string | null }
  | { kind: "not-found" }
  | {
      kind: "ready";
      workspace: PlatformWorkspaceRow & {
        public_phone: string | null;
        public_email: string | null;
        public_claim: string | null;
        public_bio: string | null;
        public_hero_url: string | null;
      };
      members: PlatformMember[];
      agents: PlatformAgent[];
      properties: PlatformProperty[];
      leads: PlatformLead[];
      notes: PlatformNote[];
      followups: PlatformFollowup[];
      adCampaignRequests: PlatformAdCampaignRequest[];
      flags: PlatformFeatureFlag[];
      activity: PlatformActivityEvent[];
      platformAdmins: PlatformMember[];
    };

export type PlatformActivityState =
  | { kind: "no-session" }
  | { kind: "forbidden"; email: string | null }
  | {
      kind: "ready";
      activity: PlatformActivityEvent[];
      workspaces: Array<{ id: string; name: string; slug: string }>;
    };

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function getConfiguredPlatformAdminEmails() {
  return (process.env.STRATE_PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeAdCampaignRequests(data: unknown[] | null | undefined): PlatformAdCampaignRequest[] {
  return (data ?? []).map((item) => {
    const request = item as {
      id: string;
      workspace_id: string;
      objective: string;
      channels?: string[] | null;
      monthly_budget_mxn?: number | null;
      target_area?: string | null;
      notes?: string | null;
      status: string;
      created_at: string;
      workspaces?: { name?: string | null; slug?: string | null } | Array<{ name?: string | null; slug?: string | null }> | null;
      profiles?: { email?: string | null } | Array<{ email?: string | null }> | null;
      properties?: { title?: string | null } | Array<{ title?: string | null }> | null;
    };
    const workspace = firstJoined(request.workspaces);
    const profile = firstJoined(request.profiles);
    const property = firstJoined(request.properties);

    return {
      id: request.id,
      workspace_id: request.workspace_id,
      workspace_name: workspace?.name ?? null,
      workspace_slug: workspace?.slug ?? null,
      requested_by_email: profile?.email ?? null,
      objective: request.objective,
      channels: request.channels ?? [],
      monthly_budget_mxn: request.monthly_budget_mxn ?? null,
      target_area: request.target_area ?? null,
      property_title: property?.title ?? null,
      notes: request.notes ?? null,
      status: request.status,
      created_at: request.created_at,
    };
  });
}

function getDateHoursAgo(dateValue: string | null | undefined) {
  if (!dateValue) return Infinity;
  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return Infinity;
  return (Date.now() - timestamp) / 36e5;
}

function isLeadStale(lead: { status?: string | null; created_at?: string | null; last_contacted_at?: string | null; next_follow_up_at?: string | null }) {
  if (lead.status === "closed" || lead.status === "lost") return false;
  if (!lead.next_follow_up_at) return true;
  if (lead.status === "new" && getDateHoursAgo(lead.created_at) >= 2) return true;
  return getDateHoursAgo(lead.last_contacted_at ?? lead.created_at) >= 48;
}

function getDefaultSubscription(workspaceId: string): PlatformSubscription {
  return {
    workspace_id: workspaceId,
    plan: "solo",
    status: "trial",
    commercial_status: "prospect",
    trial_ends_at: null,
    current_period_ends_at: null,
    external_customer_id: null,
  };
}

function normalizeSubscription(workspaceId: string, row: Partial<PlatformSubscription> | null | undefined): PlatformSubscription {
  return {
    ...getDefaultSubscription(workspaceId),
    ...row,
    commercial_status: row?.commercial_status ?? "prospect",
  };
}

function computeHealthScore({
  hasOwner,
  hasLogo,
  agentsCount,
  publishedCount,
  noCoverCount,
  noAgentCount,
  agentsWithoutWhatsappCount,
  staleLeadsCount,
  lastActivityAt,
}: {
  hasOwner: boolean;
  hasLogo: boolean;
  agentsCount: number;
  publishedCount: number;
  noCoverCount: number;
  noAgentCount: number;
  agentsWithoutWhatsappCount: number;
  staleLeadsCount: number;
  lastActivityAt: string | null;
}) {
  let score = 100;
  if (!hasOwner) score -= 22;
  if (!hasLogo) score -= 10;
  if (agentsCount === 0) score -= 14;
  if (publishedCount === 0) score -= 22;
  if (noCoverCount > 0) score -= Math.min(14, noCoverCount * 4);
  if (noAgentCount > 0) score -= Math.min(14, noAgentCount * 5);
  if (agentsWithoutWhatsappCount > 0) score -= Math.min(12, agentsWithoutWhatsappCount * 4);
  if (staleLeadsCount > 0) score -= Math.min(18, staleLeadsCount * 5);
  if (lastActivityAt && getDateHoursAgo(lastActivityAt) > 24 * 14) score -= 10;
  if (!lastActivityAt) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function getWorkspaceAlerts(row: {
  owner_email: string | null;
  public_logo_url: string | null;
  published_count: number;
  no_cover_count: number;
  no_agent_count: number;
  agents_without_whatsapp_count: number;
  stale_leads_count: number;
  last_activity_at: string | null;
}) {
  return [
    !row.owner_email ? "Sin owner visible" : null,
    !row.public_logo_url ? "Sin logo público" : null,
    row.published_count === 0 ? "Sin propiedades activas" : null,
    row.no_cover_count > 0 ? `${row.no_cover_count} propiedades activas sin portada` : null,
    row.no_agent_count > 0 ? `${row.no_agent_count} propiedades activas sin asesor` : null,
    row.agents_without_whatsapp_count > 0 ? `${row.agents_without_whatsapp_count} asesores públicos sin WhatsApp` : null,
    row.stale_leads_count > 0 ? `${row.stale_leads_count} leads sin seguimiento` : null,
    row.last_activity_at && getDateHoursAgo(row.last_activity_at) > 24 * 14 ? "Sin actividad reciente" : null,
    !row.last_activity_at ? "Sin actividad registrada" : null,
  ].filter((alert) => alert !== null);
}

export async function getPlatformAdminContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { kind: "no-session" as const, supabase, user: null, email: null };

  const email = user.email ?? null;
  const configuredEmails = getConfiguredPlatformAdminEmails();
  const isConfiguredAdmin = Boolean(email && configuredEmails.includes(email.toLowerCase()));
  const { data: allowlisted } = await supabase
    .from("platform_admins")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!isConfiguredAdmin && !allowlisted?.profile_id) {
    return { kind: "forbidden" as const, supabase, user, email };
  }

  return { kind: "ready" as const, supabase, user, email };
}

export async function assertPlatformAdmin() {
  const context = await getPlatformAdminContext();
  if (context.kind !== "ready") {
    throw new Error(context.kind === "no-session" ? "Necesitas iniciar sesión." : "No tienes permiso de platform admin.");
  }
  return context;
}

async function getExactCount(
  supabase: SupabaseServerClient,
  table: string,
  filters: Array<{ column: string; value: string | boolean | number | null; operator?: "eq" | "gte" | "is" }> = [],
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  filters.forEach((filter) => {
    if (filter.operator === "gte") {
      query = query.gte(filter.column, filter.value as string | number);
      return;
    }
    if (filter.operator === "is") {
      query = query.is(filter.column, filter.value);
      return;
    }
    query = query.eq(filter.column, filter.value);
  });
  const { count } = await query;
  return count ?? 0;
}

async function getWorkspaceRow(supabase: SupabaseServerClient, workspace: {
  id: string;
  name: string;
  slug: string;
  brand_name?: string | null;
  public_logo_url?: string | null;
  public_whatsapp?: string | null;
  is_active?: boolean;
  created_at: string;
}): Promise<PlatformWorkspaceRow> {
  const [
    { data: ownerMembership },
    { data: members },
    { data: agents },
    { data: properties },
    { data: leads },
    { data: events },
    { data: subscription },
    openFollowupsCount,
  ] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("profile_id, profiles:profile_id(full_name, email)")
      .eq("workspace_id", workspace.id)
      .eq("role", "owner")
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("workspace_members").select("id, is_active").eq("workspace_id", workspace.id).eq("is_active", true),
    supabase.from("agents").select("id, is_active, is_public, whatsapp, phone").eq("workspace_id", workspace.id).eq("is_active", true),
    supabase.from("properties").select("id, status, agent_id, property_images(id, is_cover)").eq("workspace_id", workspace.id),
    supabase.from("leads").select("id, status, created_at, next_follow_up_at, last_contacted_at").eq("workspace_id", workspace.id),
    supabase.from("activity_events").select("id, created_at").eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(1),
    supabase.from("workspace_subscriptions").select("workspace_id, plan, status, commercial_status, trial_ends_at, current_period_ends_at, external_customer_id").eq("workspace_id", workspace.id).maybeSingle(),
    getExactCount(supabase, "workspace_followups", [{ column: "workspace_id", value: workspace.id }, { column: "status", value: "open" }]),
  ]);

  const ownerProfile = firstJoined(ownerMembership?.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);
  const activeProperties = (properties ?? []).filter((property) => property.status === "active");
  const publishedCount = activeProperties.length;
  const noCoverCount = activeProperties.filter((property) => !(property.property_images ?? []).some((image: { is_cover?: boolean | null }) => image.is_cover)).length;
  const noAgentCount = activeProperties.filter((property) => !property.agent_id).length;
  const agentsWithoutWhatsappCount = (agents ?? []).filter((agent) => agent.is_public && !agent.whatsapp && !agent.phone).length;
  const staleLeadsCount = (leads ?? []).filter(isLeadStale).length;
  const lastActivityAt = events?.[0]?.created_at ?? null;
  const row = {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    brand_name: workspace.brand_name ?? null,
    public_logo_url: workspace.public_logo_url ?? null,
    public_whatsapp: workspace.public_whatsapp ?? null,
    is_active: workspace.is_active ?? true,
    created_at: workspace.created_at,
    owner_name: ownerProfile?.full_name ?? null,
    owner_email: ownerProfile?.email ?? null,
    users_count: members?.length ?? 0,
    agents_count: agents?.length ?? 0,
    properties_count: properties?.length ?? 0,
    published_count: publishedCount,
    leads_count: leads?.length ?? 0,
    no_cover_count: noCoverCount,
    no_agent_count: noAgentCount,
    agents_without_whatsapp_count: agentsWithoutWhatsappCount,
    stale_leads_count: staleLeadsCount,
    open_followups_count: openFollowupsCount,
    last_activity_at: lastActivityAt,
    health_score: computeHealthScore({
      hasOwner: Boolean(ownerProfile?.email),
      hasLogo: Boolean(workspace.public_logo_url),
      agentsCount: agents?.length ?? 0,
      publishedCount,
      noCoverCount,
      noAgentCount,
      agentsWithoutWhatsappCount,
      staleLeadsCount,
      lastActivityAt,
    }),
    subscription: normalizeSubscription(workspace.id, subscription as Partial<PlatformSubscription> | null | undefined),
    alerts: [] as string[],
    public_url: `${getPublicBaseUrl()}/w/${workspace.slug}`,
  };

  row.alerts = getWorkspaceAlerts(row);
  return row;
}

async function getPlatformActivity(
  supabase: SupabaseServerClient,
  filters: { workspaceId?: string | null; eventType?: string | null; days?: number | null } = {},
) {
  let query = supabase
    .from("activity_events")
    .select("id, workspace_id, actor_profile_id, event_type, entity_type, entity_id, metadata, created_at, workspaces:workspace_id(name), profiles:actor_profile_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(150);

  if (filters.workspaceId) query = query.eq("workspace_id", filters.workspaceId);
  if (filters.eventType) query = query.eq("event_type", filters.eventType);
  if (filters.days) {
    query = query.gte("created_at", new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000).toISOString());
  }

  const { data } = await query;

  return (data ?? []).map((event): PlatformActivityEvent => {
    const workspace = firstJoined(event.workspaces as { name?: string | null } | Array<{ name?: string | null }> | null | undefined);
    const actor = firstJoined(event.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);
    return {
      id: event.id,
      workspace_id: event.workspace_id ?? null,
      workspace_name: workspace?.name ?? null,
      actor_name: actor?.full_name ?? null,
      actor_email: actor?.email ?? null,
      event_type: event.event_type,
      entity_type: event.entity_type ?? null,
      entity_id: event.entity_id ?? null,
      metadata: asObject(event.metadata),
      created_at: event.created_at,
    };
  });
}

export async function getPlatformAdminState(searchParams: { q?: string; health?: string; alert?: string } = {}): Promise<PlatformAdminState> {
  const context = await getPlatformAdminContext();
  if (context.kind === "no-session") return { kind: "no-session" };
  if (context.kind === "forbidden") return { kind: "forbidden", email: context.email };

  const { supabase } = context;
  const [{ data: workspaces }, activity, { data: announcements }, { data: adCampaignRequests }] = await Promise.all([
    supabase.from("workspaces").select("id, name, slug, brand_name, public_logo_url, public_whatsapp, is_active, created_at").order("created_at", { ascending: false }).limit(100),
    getPlatformActivity(supabase, { days: 30 }),
    supabase.from("platform_announcements").select("id, title, body, audience, is_active, starts_at, ends_at, created_at").order("created_at", { ascending: false }).limit(8),
    supabase
      .from("ad_campaign_requests")
      .select("id, workspace_id, objective, channels, monthly_budget_mxn, target_area, notes, status, created_at, workspaces:workspace_id(name, slug), profiles:requested_by_profile_id(email), properties:promoted_property_id(title)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  let workspaceRows = await Promise.all((workspaces ?? []).map((workspace) => getWorkspaceRow(supabase, workspace)));
  const q = searchParams.q?.trim().toLowerCase();
  if (q) {
    workspaceRows = workspaceRows.filter((workspace) =>
      [workspace.name, workspace.slug, workspace.brand_name, workspace.owner_name, workspace.owner_email]
        .some((value) => value?.toLowerCase().includes(q)),
    );
  }

  if (searchParams.health === "critical") workspaceRows = workspaceRows.filter((workspace) => workspace.health_score < 55);
  if (searchParams.health === "medium") workspaceRows = workspaceRows.filter((workspace) => workspace.health_score >= 55 && workspace.health_score < 80);
  if (searchParams.health === "healthy") workspaceRows = workspaceRows.filter((workspace) => workspace.health_score >= 80);

  if (searchParams.alert === "no_logo") workspaceRows = workspaceRows.filter((workspace) => !workspace.public_logo_url);
  if (searchParams.alert === "no_active_properties") workspaceRows = workspaceRows.filter((workspace) => workspace.published_count === 0);
  if (searchParams.alert === "no_leads") workspaceRows = workspaceRows.filter((workspace) => workspace.leads_count === 0);
  if (searchParams.alert === "no_activity") workspaceRows = workspaceRows.filter((workspace) => !workspace.last_activity_at || getDateHoursAgo(workspace.last_activity_at) > 24 * 14);

  const recentBoundary = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [users, properties, publishedProperties, leads, recentEvents, openFollowups, conversions7d, whatsappClicks7d, openAdRequests] = await Promise.all([
    getExactCount(supabase, "profiles"),
    getExactCount(supabase, "properties"),
    getExactCount(supabase, "properties", [{ column: "status", value: "active" }]),
    getExactCount(supabase, "leads"),
    getExactCount(supabase, "activity_events", [{ column: "created_at", value: recentBoundary, operator: "gte" }]),
    getExactCount(supabase, "workspace_followups", [{ column: "status", value: "open" }]),
    getExactCount(supabase, "public_conversion_events", [{ column: "created_at", value: recentBoundary, operator: "gte" }]),
    getExactCount(supabase, "public_conversion_events", [{ column: "created_at", value: recentBoundary, operator: "gte" }, { column: "event_type", value: "whatsapp_click" }]),
    getExactCount(supabase, "ad_campaign_requests", [{ column: "status", value: "requested" }]),
  ]);
  const salesPipeline = workspaceRows.reduce<Record<PlatformCommercialStatus, number>>((acc, workspace) => {
    const status = workspace.subscription?.commercial_status ?? "prospect";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, { prospect: 0, demo: 0, customer: 0, risk: 0, churn: 0 });

  return {
    kind: "ready",
    totals: {
      workspaces: workspaces?.length ?? 0,
      activeWorkspaces: (workspaces ?? []).filter((workspace) => workspace.is_active).length,
      users,
      properties,
      publishedProperties,
      leads,
      recentEvents,
      openFollowups,
      staleAccounts: workspaceRows.filter((workspace) => !workspace.last_activity_at || getDateHoursAgo(workspace.last_activity_at) > 24 * 14).length,
      conversions7d,
      whatsappClicks7d,
      adRequests: openAdRequests,
    },
    salesPipeline,
    workspaces: workspaceRows,
    activity: activity.slice(0, 12),
    announcements: (announcements ?? []) as PlatformAnnouncement[],
    adCampaignRequests: normalizeAdCampaignRequests(adCampaignRequests as unknown[] | null),
  };
}

export async function getPlatformWorkspaceDetail(workspaceId: string): Promise<PlatformWorkspaceDetailState> {
  const context = await getPlatformAdminContext();
  if (context.kind === "no-session") return { kind: "no-session" };
  if (context.kind === "forbidden") return { kind: "forbidden", email: context.email };

  const { supabase } = context;
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, brand_name, public_logo_url, public_hero_url, public_phone, public_whatsapp, public_email, public_claim, public_bio, is_active, created_at")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!workspace) return { kind: "not-found" };

  const [
    workspaceRow,
    { data: members },
    { data: agents },
    { data: properties },
    { data: leads },
    { data: notes },
    { data: followups },
    { data: adCampaignRequests },
    { data: flags },
    activity,
    { data: platformAdmins },
  ] = await Promise.all([
    getWorkspaceRow(supabase, workspace),
    supabase.from("workspace_members").select("id, profile_id, role, is_active, joined_at, profiles:profile_id(full_name, email)").eq("workspace_id", workspaceId).order("created_at", { ascending: true }),
    supabase.from("agents").select("id, display_name, slug, email, phone, whatsapp, is_public, is_active").eq("workspace_id", workspaceId).order("display_name", { ascending: true }),
    supabase.from("properties").select("id, title, slug, status, agent_id, price_amount, currency_code, location_label, created_at, updated_at, agents:agent_id(display_name), property_images(id, is_cover)").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }).limit(30),
    supabase.from("leads").select("id, full_name, phone, email, status, source_type, next_follow_up_at, last_contacted_at, created_at, agents:assigned_agent_id(display_name)").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(30),
    supabase.from("workspace_admin_notes").select("id, body, created_at, profiles:author_profile_id(full_name, email)").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(20),
    supabase.from("workspace_followups").select("id, title, due_at, status, completed_at, created_at, profiles:assigned_profile_id(full_name, email)").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(20),
    supabase
      .from("ad_campaign_requests")
      .select("id, workspace_id, objective, channels, monthly_budget_mxn, target_area, notes, status, created_at, workspaces:workspace_id(name, slug), profiles:requested_by_profile_id(email), properties:promoted_property_id(title)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("workspace_feature_flags").select("workspace_id, flag_key, enabled, metadata, updated_at").eq("workspace_id", workspaceId).order("flag_key", { ascending: true }),
    getPlatformActivity(supabase, { workspaceId }),
    supabase.from("platform_admins").select("profile_id, profiles:profile_id(full_name, email)"),
  ]);

  return {
    kind: "ready",
    workspace: {
      ...workspaceRow,
      public_phone: workspace.public_phone ?? null,
      public_email: workspace.public_email ?? null,
      public_claim: workspace.public_claim ?? null,
      public_bio: workspace.public_bio ?? null,
      public_hero_url: workspace.public_hero_url ?? null,
    },
    members: (members ?? []).map((member): PlatformMember => {
      const profile = firstJoined(member.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);
      return {
        membership_id: member.id,
        profile_id: member.profile_id,
        role: member.role,
        is_active: member.is_active,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
        joined_at: member.joined_at ?? null,
      };
    }),
    agents: (agents ?? []) as PlatformAgent[],
    properties: (properties ?? []).map((property): PlatformProperty => {
      const agent = firstJoined(property.agents as { display_name?: string | null } | Array<{ display_name?: string | null }> | null | undefined);
      const images = property.property_images ?? [];
      return {
        id: property.id,
        title: property.title,
        slug: property.slug,
        status: property.status,
        agent_id: property.agent_id ?? null,
        agent_name: agent?.display_name ?? null,
        price_amount: property.price_amount ?? null,
        currency_code: property.currency_code,
        location_label: property.location_label ?? null,
        created_at: property.created_at,
        updated_at: property.updated_at,
        images_count: images.length,
        has_cover: images.some((image: { is_cover?: boolean | null }) => image.is_cover),
      };
    }),
    leads: (leads ?? []).map((lead): PlatformLead => {
      const agent = firstJoined(lead.agents as { display_name?: string | null } | Array<{ display_name?: string | null }> | null | undefined);
      return {
        id: lead.id,
        full_name: lead.full_name,
        phone: lead.phone,
        email: lead.email ?? null,
        status: lead.status,
        source_type: lead.source_type ?? null,
        next_follow_up_at: lead.next_follow_up_at ?? null,
        last_contacted_at: lead.last_contacted_at ?? null,
        created_at: lead.created_at,
        assigned_agent_name: agent?.display_name ?? null,
      };
    }),
    notes: (notes ?? []).map((note): PlatformNote => {
      const author = firstJoined(note.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);
      return {
        id: note.id,
        body: note.body,
        created_at: note.created_at,
        author_name: author?.full_name ?? null,
        author_email: author?.email ?? null,
      };
    }),
    followups: (followups ?? []).map((followup): PlatformFollowup => {
      const assigned = firstJoined(followup.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);
      return {
        id: followup.id,
        title: followup.title,
        due_at: followup.due_at ?? null,
        status: followup.status,
        completed_at: followup.completed_at ?? null,
        created_at: followup.created_at,
        assigned_name: assigned?.full_name ?? null,
        assigned_email: assigned?.email ?? null,
      };
    }),
    adCampaignRequests: normalizeAdCampaignRequests(adCampaignRequests as unknown[] | null),
    flags: (flags ?? []).map((flag) => ({ ...flag, metadata: asObject(flag.metadata) })) as PlatformFeatureFlag[],
    activity: activity.slice(0, 50),
    platformAdmins: (platformAdmins ?? []).map((admin): PlatformMember => {
      const profile = firstJoined(admin.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);
      return {
        membership_id: admin.profile_id,
        profile_id: admin.profile_id,
        role: "platform_admin",
        is_active: true,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
        joined_at: null,
      };
    }),
  };
}

export async function getPlatformActivityState(filters: { workspaceId?: string | null; eventType?: string | null; days?: number | null } = {}): Promise<PlatformActivityState> {
  const context = await getPlatformAdminContext();
  if (context.kind === "no-session") return { kind: "no-session" };
  if (context.kind === "forbidden") return { kind: "forbidden", email: context.email };

  const { supabase } = context;
  const [{ data: workspaces }, activity] = await Promise.all([
    supabase.from("workspaces").select("id, name, slug").order("name", { ascending: true }),
    getPlatformActivity(supabase, filters),
  ]);

  return {
    kind: "ready",
    workspaces: workspaces ?? [],
    activity,
  };
}

export async function getPlatformCsvRows(kind: "workspaces" | "activity" | "leads" | "conversions") {
  const context = await assertPlatformAdmin();
  const { supabase } = context;

  if (kind === "activity") {
    const activity = await getPlatformActivity(supabase);
    return activity.map((event) => ({
      created_at: event.created_at,
      workspace: event.workspace_name ?? "",
      event_type: event.event_type,
      actor: event.actor_email ?? event.actor_name ?? "",
      entity_type: event.entity_type ?? "",
      entity_id: event.entity_id ?? "",
    }));
  }

  if (kind === "leads") {
    const { data } = await supabase
      .from("leads")
      .select("created_at, workspace_id, full_name, phone, email, status, source_type, workspaces:workspace_id(name, slug)")
      .order("created_at", { ascending: false })
      .limit(1000);

    return (data ?? []).map((lead) => {
      const workspace = firstJoined(lead.workspaces as { name?: string | null; slug?: string | null } | Array<{ name?: string | null; slug?: string | null }> | null | undefined);
      return {
        created_at: lead.created_at,
        workspace: workspace?.name ?? "",
        slug: workspace?.slug ?? "",
        full_name: lead.full_name,
        phone: lead.phone,
        email: lead.email ?? "",
        status: lead.status,
        source_type: lead.source_type ?? "",
      };
    });
  }

  if (kind === "conversions") {
    const { data } = await supabase
      .from("public_conversion_events")
      .select("created_at, workspace_id, event_type, path, source, workspaces:workspace_id(name, slug), properties:property_id(title)")
      .order("created_at", { ascending: false })
      .limit(1000);

    return (data ?? []).map((event) => {
      const workspace = firstJoined(event.workspaces as { name?: string | null; slug?: string | null } | Array<{ name?: string | null; slug?: string | null }> | null | undefined);
      const property = firstJoined(event.properties as { title?: string | null } | Array<{ title?: string | null }> | null | undefined);
      return {
        created_at: event.created_at,
        workspace: workspace?.name ?? "",
        slug: workspace?.slug ?? "",
        event_type: event.event_type,
        property: property?.title ?? "",
        path: event.path ?? "",
        source: event.source ?? "",
      };
    });
  }

  const { data: workspaces } = await supabase.from("workspaces").select("id, name, slug, brand_name, public_logo_url, public_whatsapp, is_active, created_at").order("created_at", { ascending: false }).limit(1000);
  const rows = await Promise.all((workspaces ?? []).map((workspace) => getWorkspaceRow(supabase, workspace)));
  return rows.map((workspace) => ({
    name: workspace.name,
    slug: workspace.slug,
    owner_email: workspace.owner_email ?? "",
    health_score: workspace.health_score,
    plan: workspace.subscription?.plan ?? "",
    status: workspace.subscription?.status ?? "",
    commercial_status: workspace.subscription?.commercial_status ?? "",
    properties: workspace.properties_count,
    published: workspace.published_count,
    leads: workspace.leads_count,
    alerts: workspace.alerts.join(" | "),
  }));
}
