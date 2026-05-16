import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlatformWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  brand_name: string | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  users_count: number;
  agents_count: number;
  properties_count: number;
  published_count: number;
  leads_count: number;
  missing_cover_count: number;
  health_score: number;
};

export type PlatformActivityEvent = {
  id: string;
  workspace_id: string | null;
  workspace_name: string | null;
  event_type: string;
  entity_type: string | null;
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
      };
      workspaces: PlatformWorkspaceRow[];
      activity: PlatformActivityEvent[];
    };

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

async function isPlatformAdmin(profileId: string, email: string | null) {
  const configuredEmails = getConfiguredPlatformAdminEmails();
  if (email && configuredEmails.includes(email.toLowerCase())) return true;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("platform_admins")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.profile_id);
}

async function getExactCount(
  table: string,
  filters: Array<{ column: string; value: string | boolean | number | null; operator?: "eq" | "gte" | "is" }> = [],
) {
  const supabase = await createSupabaseServerClient();
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

function computeHealthScore({
  agentsCount,
  propertiesCount,
  publishedCount,
  leadsCount,
  missingCoverCount,
}: {
  agentsCount: number;
  propertiesCount: number;
  publishedCount: number;
  leadsCount: number;
  missingCoverCount: number;
}) {
  let score = 20;
  if (agentsCount > 0) score += 15;
  if (propertiesCount > 0) score += 20;
  if (publishedCount > 0) score += 20;
  if (leadsCount > 0) score += 15;
  if (propertiesCount > 0 && missingCoverCount === 0) score += 10;
  return Math.max(0, Math.min(100, score));
}

export async function getPlatformAdminState(): Promise<PlatformAdminState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { kind: "no-session" };

  const email = user.email ?? null;
  const allowed = await isPlatformAdmin(user.id, email);
  if (!allowed) return { kind: "forbidden", email };

  const [{ data: workspaces }, { data: activity }] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name, slug, brand_name, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("activity_events")
      .select(
        `
          id,
          workspace_id,
          event_type,
          entity_type,
          created_at,
          workspaces:workspace_id (
            name
          )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const workspaceRows = await Promise.all(
    (workspaces ?? []).map(async (workspace) => {
      const [
        usersCount,
        agentsCount,
        propertiesCount,
        publishedCount,
        leadsCount,
        missingCoverCount,
        { data: ownerMembership },
      ] = await Promise.all([
        getExactCount("workspace_members", [{ column: "workspace_id", value: workspace.id }, { column: "is_active", value: true }]),
        getExactCount("agents", [{ column: "workspace_id", value: workspace.id }, { column: "is_active", value: true }]),
        getExactCount("properties", [{ column: "workspace_id", value: workspace.id }]),
        getExactCount("properties", [{ column: "workspace_id", value: workspace.id }, { column: "status", value: "active" }]),
        getExactCount("leads", [{ column: "workspace_id", value: workspace.id }]),
        getExactCount("properties", [{ column: "workspace_id", value: workspace.id }, { column: "status", value: "active" }, { column: "agent_id", value: null, operator: "is" }]),
        supabase
          .from("workspace_members")
          .select(
            `
              profile_id,
              profiles:profile_id (
                full_name,
                email
              )
            `,
          )
          .eq("workspace_id", workspace.id)
          .eq("role", "owner")
          .maybeSingle(),
      ]);

      const ownerProfile = firstJoined(ownerMembership?.profiles as { full_name?: string | null; email?: string | null } | Array<{ full_name?: string | null; email?: string | null }> | null | undefined);

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        brand_name: workspace.brand_name ?? null,
        created_at: workspace.created_at,
        owner_name: ownerProfile?.full_name ?? null,
        owner_email: ownerProfile?.email ?? null,
        users_count: usersCount,
        agents_count: agentsCount,
        properties_count: propertiesCount,
        published_count: publishedCount,
        leads_count: leadsCount,
        missing_cover_count: missingCoverCount,
        health_score: computeHealthScore({ agentsCount, propertiesCount, publishedCount, leadsCount, missingCoverCount }),
      };
    }),
  );

  const recentBoundary = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [users, properties, publishedProperties, leads, recentEvents] = await Promise.all([
    getExactCount("profiles"),
    getExactCount("properties"),
    getExactCount("properties", [{ column: "status", value: "active" }]),
    getExactCount("leads"),
    getExactCount("activity_events", [{ column: "created_at", value: recentBoundary, operator: "gte" }]),
  ]);

  return {
    kind: "ready",
    totals: {
      workspaces: workspaceRows.length,
      activeWorkspaces: (workspaces ?? []).filter((workspace) => workspace.is_active).length,
      users,
      properties,
      publishedProperties,
      leads,
      recentEvents,
    },
    workspaces: workspaceRows,
    activity: (activity ?? []).map((event) => ({
      id: event.id,
      workspace_id: event.workspace_id ?? null,
      workspace_name: firstJoined(event.workspaces as { name?: string | null } | Array<{ name?: string | null }> | null | undefined)?.name ?? null,
      event_type: event.event_type,
      entity_type: event.entity_type ?? null,
      created_at: event.created_at,
    })),
  };
}
