import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerActiveWorkspace } from "@/lib/workspace/server";

type Joined<T> = T | T[] | null | undefined;

function firstJoined<T>(value: Joined<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function scorePropertyMatch(lead: LeadDetail["lead"], property: LeadDetail["properties"][number]) {
  let score = 0;
  const reasons: string[] = [];

  if (lead.preferred_operation && property.operation_type === lead.preferred_operation) {
    score += 24;
    reasons.push("operación");
  }

  if (lead.preferred_property_type && property.property_type === lead.preferred_property_type) {
    score += 22;
    reasons.push("tipo");
  }

  const location = lead.preferred_location?.toLowerCase().trim();
  const propertyLocation = [property.location_label, property.neighborhood, property.city, property.state].filter(Boolean).join(" ").toLowerCase();
  if (location && propertyLocation.includes(location)) {
    score += 22;
    reasons.push("zona");
  }

  if (lead.budget_max && property.price_amount && property.price_amount <= lead.budget_max) {
    score += 16;
    reasons.push("presupuesto");
  }

  if (lead.budget_min && property.price_amount && property.price_amount >= lead.budget_min) {
    score += 6;
  }

  if (lead.bedrooms_min && property.bedrooms && property.bedrooms >= lead.bedrooms_min) {
    score += 10;
    reasons.push("recámaras");
  }

  if (!reasons.length) {
    score = property.status === "active" ? 8 : 0;
    reasons.push("inventario disponible");
  }

  return { score: Math.min(100, score), reasons };
}

export type LeadDetail = {
  workspace: {
    id: string;
    slug: string | null;
  };
  lead: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
    message: string | null;
    internal_note: string | null;
    status: string;
    source_type: string | null;
    source_detail: string | null;
    assigned_agent_id: string | null;
    next_follow_up_at: string | null;
    last_contacted_at: string | null;
    created_at: string;
    preferred_operation: string | null;
    preferred_property_type: string | null;
    preferred_location: string | null;
    budget_min: number | null;
    budget_max: number | null;
    bedrooms_min: number | null;
    urgency: string | null;
    lost_reason: string | null;
  };
  assignedAgent: {
    id: string;
    display_name: string;
    whatsapp: string | null;
  } | null;
  agents: Array<{ id: string; display_name: string; whatsapp: string | null }>;
  properties: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    operation_type: string;
    property_type: string | null;
    location_label: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    price_amount: number | null;
    currency_code: string;
    bedrooms: number | null;
  }>;
  interests: Array<{ property_id: string; title: string; slug: string; created_at: string }>;
  notes: Array<{ id: string; body: string; created_at: string; author_name: string | null }>;
  tasks: Array<{ id: string; title: string; due_at: string | null; status: string; completed_at: string | null }>;
  appointments: Array<{
    id: string;
    title: string;
    scheduled_at: string;
    status: string;
    result_note: string | null;
    property_title: string | null;
    agent_name: string | null;
  }>;
  matches: Array<{
    property: LeadDetail["properties"][number];
    score: number;
    reasons: string[];
  }>;
};

export async function getLeadDetail(leadId: string): Promise<LeadDetail | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const activeWorkspace = await getServerActiveWorkspace(user);
  if (!activeWorkspace?.workspaceId) return null;

  const [
    { data: lead },
    { data: agents },
    { data: properties },
    { data: interests },
    { data: notes },
    { data: tasks },
    { data: appointments },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select(`
        id,
        full_name,
        phone,
        email,
        message,
        internal_note,
        status,
        source_type,
        source_detail,
        assigned_agent_id,
        next_follow_up_at,
        last_contacted_at,
        created_at,
        preferred_operation,
        preferred_property_type,
        preferred_location,
        budget_min,
        budget_max,
        bedrooms_min,
        urgency,
        lost_reason,
        agents:assigned_agent_id(id, display_name, whatsapp)
      `)
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("id", leadId)
      .maybeSingle(),
    supabase.from("agents").select("id, display_name, whatsapp").eq("workspace_id", activeWorkspace.workspaceId).eq("is_active", true).order("display_name", { ascending: true }),
    supabase
      .from("properties")
      .select("id, title, slug, status, operation_type, property_type, location_label, neighborhood, city, state, price_amount, currency_code, bedrooms")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("lead_property_interests")
      .select("created_at, properties:property_id(id, title, slug)")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_notes")
      .select("id, body, created_at, profiles:author_profile_id(full_name)")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_tasks")
      .select("id, title, due_at, status, completed_at")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_appointments")
      .select("id, title, scheduled_at, status, result_note, properties:property_id(title), agents:assigned_agent_id(display_name)")
      .eq("workspace_id", activeWorkspace.workspaceId)
      .eq("lead_id", leadId)
      .order("scheduled_at", { ascending: false }),
  ]);

  if (!lead) return null;

  const assignedAgent = firstJoined(lead.agents as Joined<{ id: string; display_name: string; whatsapp: string | null }>);
  const normalizedLead = {
    id: lead.id,
    full_name: lead.full_name,
    phone: lead.phone,
    email: lead.email ?? null,
    message: lead.message ?? null,
    internal_note: lead.internal_note ?? null,
    status: lead.status,
    source_type: lead.source_type ?? null,
    source_detail: lead.source_detail ?? null,
    assigned_agent_id: lead.assigned_agent_id ?? null,
    next_follow_up_at: lead.next_follow_up_at ?? null,
    last_contacted_at: lead.last_contacted_at ?? null,
    created_at: lead.created_at,
    preferred_operation: lead.preferred_operation ?? null,
    preferred_property_type: lead.preferred_property_type ?? null,
    preferred_location: lead.preferred_location ?? null,
    budget_min: lead.budget_min ?? null,
    budget_max: lead.budget_max ?? null,
    bedrooms_min: lead.bedrooms_min ?? null,
    urgency: lead.urgency ?? null,
    lost_reason: lead.lost_reason ?? null,
  };

  const normalizedProperties = (properties ?? []).map((property) => ({
    id: property.id,
    title: property.title,
    slug: property.slug,
    status: property.status,
    operation_type: property.operation_type,
    property_type: property.property_type ?? null,
    location_label: property.location_label ?? null,
    neighborhood: property.neighborhood ?? null,
    city: property.city ?? null,
    state: property.state ?? null,
    price_amount: property.price_amount ?? null,
    currency_code: property.currency_code,
    bedrooms: property.bedrooms ?? null,
  }));

  const matches = normalizedProperties
    .filter((property) => property.status === "active")
    .map((property) => ({ property, ...scorePropertyMatch(normalizedLead, property) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    workspace: {
      id: activeWorkspace.workspaceId,
      slug: activeWorkspace.workspaceSlug ?? null,
    },
    lead: normalizedLead,
    assignedAgent,
    agents: agents ?? [],
    properties: normalizedProperties,
    interests: (interests ?? []).map((interest) => {
      const property = firstJoined(interest.properties as Joined<{ id: string; title: string; slug: string }>);
      return property ? { property_id: property.id, title: property.title, slug: property.slug, created_at: interest.created_at } : null;
    }).filter((interest) => interest !== null),
    notes: (notes ?? []).map((note) => {
      const author = firstJoined(note.profiles as Joined<{ full_name?: string | null }>);
      return {
        id: note.id,
        body: note.body,
        created_at: note.created_at,
        author_name: author?.full_name ?? null,
      };
    }),
    tasks: tasks ?? [],
    appointments: (appointments ?? []).map((appointment) => {
      const property = firstJoined(appointment.properties as Joined<{ title?: string | null }>);
      const agent = firstJoined(appointment.agents as Joined<{ display_name?: string | null }>);
      return {
        id: appointment.id,
        title: appointment.title,
        scheduled_at: appointment.scheduled_at,
        status: appointment.status,
        result_note: appointment.result_note ?? null,
        property_title: property?.title ?? null,
        agent_name: agent?.display_name ?? null,
      };
    }),
    matches,
  };
}
