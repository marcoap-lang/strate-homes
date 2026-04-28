"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServerActiveWorkspace } from "@/lib/workspace/server";

export type BootstrapOwnerState = {
  success: boolean;
  message: string;
};

export type PropertyFormState = {
  success: boolean;
  message: string;
};

export type AgentProfileState = {
  success: boolean;
  message: string;
};

export type CreateAgentState = {
  success: boolean;
  message: string;
};

export type LeadCaptureState = {
  success: boolean;
  message: string;
};

export type LeadUpdateState = {
  success: boolean;
  message: string;
};

export type PropertyLeadCreateState = {
  success: boolean;
  message: string;
};

const INITIAL_STATE: PropertyFormState = {
  success: false,
  message: "",
};

const INITIAL_AGENT_PROFILE_STATE: AgentProfileState = {
  success: false,
  message: "",
};

const INITIAL_BOOTSTRAP_STATE: BootstrapOwnerState = {
  success: false,
  message: "",
};

const INITIAL_CREATE_AGENT_STATE: CreateAgentState = {
  success: false,
  message: "",
};

const INITIAL_LEAD_CAPTURE_STATE: LeadCaptureState = {
  success: false,
  message: "",
};

const INITIAL_LEAD_UPDATE_STATE: LeadUpdateState = {
  success: false,
  message: "",
};

const INITIAL_PROPERTY_LEAD_CREATE_STATE: PropertyLeadCreateState = {
  success: false,
  message: "",
};

function normalizeNullable(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text ? text : null;
}

function normalizeNumber(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getReadableBootstrapError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("authentication_required")) {
    return "Necesitas iniciar sesión otra vez antes de crear tu espacio.";
  }

  if (normalized.includes("profile_not_ready")) {
    return "Tu cuenta todavía se está preparando. Espera unos segundos e inténtalo de nuevo.";
  }

  if (normalized.includes("active_membership_exists")) {
    return "Tu cuenta ya tiene acceso a un workspace. Recarga el admin para continuar.";
  }

  if (normalized.includes("invalid_workspace_name")) {
    return "Escribe un nombre válido para tu espacio de trabajo.";
  }

  if (normalized.includes("invalid_workspace_slug")) {
    return "El identificador del workspace no es válido. Usa letras minúsculas, números o guiones.";
  }

  if (normalized.includes("duplicate key value") || normalized.includes("workspaces_slug_key")) {
    return "Ese identificador ya está en uso. Prueba con otro slug.";
  }

  if (normalized.includes("row-level security")) {
    return "No pudimos activar tu workspace inicial. Intenta de nuevo en unos segundos.";
  }

  return "No pudimos crear tu espacio inicial. Intenta de nuevo.";
}

function canManageFullInventory(role: string | null | undefined) {
  return role === "owner" || role === "admin";
}

function canManageAgentProfiles(role: string | null | undefined) {
  return role === "owner" || role === "admin";
}

function canArchiveOrCloseProperty(role: string | null | undefined) {
  return role === "owner" || role === "admin";
}

function getAllowedAgentId({
  requestedAgentId,
  activeRole,
  ownAgentId,
}: {
  requestedAgentId: string | null;
  activeRole: string | null | undefined;
  ownAgentId: string | null;
}) {
  if (canManageFullInventory(activeRole)) {
    return requestedAgentId ?? ownAgentId;
  }

  return ownAgentId;
}

async function getWorkspaceContext() {
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

  const { data: agentRecord } = await supabase
    .from("agents")
    .select("id, profile_id")
    .eq("workspace_id", activeWorkspace.workspaceId)
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return { supabase, activeWorkspace, user, agentRecord };
}

async function getPropertyAccessContext(propertyId: string) {
  const context = await getWorkspaceContext();
  const { supabase, activeWorkspace, agentRecord } = context;

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, workspace_id, agent_id, status")
    .eq("id", propertyId)
    .eq("workspace_id", activeWorkspace.workspaceId)
    .maybeSingle();

  if (error) throw error;

  if (!property) {
    throw new Error("No encontramos esa propiedad dentro del workspace activo.");
  }

  const isFullAccessRole = canManageFullInventory(activeWorkspace.role);
  const isAssignedAgent = Boolean(agentRecord?.id && property.agent_id === agentRecord.id);

  return {
    ...context,
    property,
    isFullAccessRole,
    isAssignedAgent,
    canEditProperty: isFullAccessRole || isAssignedAgent,
  };
}

async function getTeamMemberProfileContext(profileId: string) {
  const context = await getWorkspaceContext();
  const { supabase, activeWorkspace, user } = context;

  if (!canManageAgentProfiles(activeWorkspace.role)) {
    throw new Error("Solo owner/admin pueden activar o editar perfiles comerciales.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, profile_id, role")
    .eq("workspace_id", activeWorkspace.workspaceId)
    .eq("profile_id", profileId)
    .eq("is_active", true)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) throw new Error("No encontramos a esa persona dentro del workspace activo.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error("No encontramos el perfil base de esa persona.");

  const { data: existingAgent, error: agentError } = await supabase
    .from("agents")
    .select("id, profile_id, slug, display_name")
    .eq("workspace_id", activeWorkspace.workspaceId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (agentError) throw agentError;

  return {
    ...context,
    actingUserId: user.id,
    membership,
    profile,
    existingAgent,
  };
}

export async function bootstrapInitialOwnerAction(
  _prevState: BootstrapOwnerState = INITIAL_BOOTSTRAP_STATE,
  formData: FormData,
): Promise<BootstrapOwnerState> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Necesitas iniciar sesión primero." };
    }

    const workspaceName = formData.get("workspaceName")?.toString().trim() ?? "";

    if (workspaceName.length < 3) {
      return { success: false, message: "El nombre del workspace debe tener al menos 3 caracteres." };
    }

    const workspaceSlug = slugify(formData.get("workspaceSlug")?.toString() || workspaceName);

    const { data, error } = await supabase.rpc("bootstrap_initial_workspace", {
      input_workspace_name: workspaceName,
      input_workspace_slug: workspaceSlug,
    });

    if (error) {
      return { success: false, message: getReadableBootstrapError(error.message) };
    }

    const workspace = Array.isArray(data) ? data[0] : data;

    if (!workspace?.workspace_id) {
      return { success: false, message: "No pudimos activar tu espacio inicial. Intenta de nuevo." };
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: `Tu espacio inicial ya está listo: ${workspace.created_workspace_name}. Ya puedes continuar al admin.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo habilitar el usuario inicial.",
    };
  }
}

export async function captureLeadFromPropertyAction(
  _prevState: LeadCaptureState = INITIAL_LEAD_CAPTURE_STATE,
  formData: FormData,
): Promise<LeadCaptureState> {
  try {
    const supabase = await createSupabaseServerClient();
    const propertyId = formData.get("propertyId")?.toString();
    const workspaceId = formData.get("workspaceId")?.toString();
    const fullName = formData.get("fullName")?.toString().trim() ?? "";
    const phone = formData.get("phone")?.toString().trim() ?? "";

    if (!propertyId || !workspaceId) {
      return { success: false, message: "No pudimos relacionar tu mensaje con la propiedad." };
    }

    if (fullName.length < 3 || phone.length < 7) {
      return { success: false, message: "Comparte al menos tu nombre y un teléfono válido." };
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        workspace_id: workspaceId,
        full_name: fullName,
        phone,
        email: normalizeNullable(formData.get("email")),
        message: normalizeNullable(formData.get("message")),
        source_type: normalizeNullable(formData.get("sourceType")) ?? "property_form",
        status: "new",
      })
      .select("id")
      .single();

    if (leadError || !lead?.id) {
      return { success: false, message: leadError?.message ?? "No pudimos guardar tu contacto." };
    }

    const { error: interestError } = await supabase.from("lead_property_interests").insert({
      workspace_id: workspaceId,
      lead_id: lead.id,
      property_id: propertyId,
    });

    if (interestError) {
      return { success: false, message: interestError.message };
    }

    return { success: true, message: "Gracias. Ya recibimos tus datos y te contactaremos pronto." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos guardar tu interés.",
    };
  }
}

export async function updateLeadStateAction(
  _prevState: LeadUpdateState = INITIAL_LEAD_UPDATE_STATE,
  formData: FormData,
): Promise<LeadUpdateState> {
  try {
    const { supabase, activeWorkspace } = await getWorkspaceContext();
    const leadId = formData.get("leadId")?.toString();
    const status = formData.get("status")?.toString();

    if (!leadId || !status) {
      return { success: false, message: "Faltan datos para actualizar el lead." };
    }

    const { error } = await supabase
      .from("leads")
      .update({
        status,
        internal_note: normalizeNullable(formData.get("internalNote")),
      })
      .eq("id", leadId)
      .eq("workspace_id", activeWorkspace.workspaceId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/leads");
    return { success: true, message: "Lead actualizado correctamente." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo actualizar el lead.",
    };
  }
}

export async function createPropertyLeadAction(
  _prevState: PropertyLeadCreateState = INITIAL_PROPERTY_LEAD_CREATE_STATE,
  formData: FormData,
): Promise<PropertyLeadCreateState> {
  try {
    const { supabase, activeWorkspace } = await getWorkspaceContext();
    const propertyId = formData.get("propertyId")?.toString();
    const fullName = formData.get("fullName")?.toString().trim() ?? "";
    const phone = formData.get("phone")?.toString().trim() ?? "";

    if (!propertyId || fullName.length < 3 || phone.length < 7) {
      return { success: false, message: "Comparte al menos nombre y teléfono válidos." };
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        workspace_id: activeWorkspace.workspaceId,
        full_name: fullName,
        phone,
        email: normalizeNullable(formData.get("email")),
        message: normalizeNullable(formData.get("message")),
        internal_note: normalizeNullable(formData.get("message")),
        source_type: "manual",
        status: "new",
      })
      .select("id")
      .single();

    if (leadError || !lead?.id) {
      return { success: false, message: leadError?.message ?? "No pudimos crear el lead." };
    }

    const { error: interestError } = await supabase.from("lead_property_interests").insert({
      workspace_id: activeWorkspace.workspaceId,
      lead_id: lead.id,
      property_id: propertyId,
    });

    if (interestError) {
      return { success: false, message: interestError.message };
    }

    revalidatePath(`/admin/properties/${propertyId}`);
    revalidatePath(`/admin/leads`);
    return { success: true, message: "Lead agregado correctamente a esta propiedad." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo crear el lead manual.",
    };
  }
}

export async function createAgentAction(
  _prevState: CreateAgentState = INITIAL_CREATE_AGENT_STATE,
  formData: FormData,
): Promise<CreateAgentState> {
  try {
    const { supabase, activeWorkspace } = await getWorkspaceContext();

    if (!canManageAgentProfiles(activeWorkspace.role)) {
      return { success: false, message: "Solo owner/admin pueden crear asesores." };
    }

    const accessType = formData.get("accessType")?.toString() === "with-access" ? "with-access" : "public-only";
    const displayName = formData.get("displayName")?.toString().trim() ?? "";
    const slug = slugify(formData.get("slug")?.toString() || displayName);
    const email = normalizeNullable(formData.get("email"));

    if (displayName.length < 3) {
      return { success: false, message: "El nombre público del asesor debe tener al menos 3 caracteres." };
    }

    if (slug.length < 3) {
      return { success: false, message: "El slug del asesor debe tener al menos 3 caracteres." };
    }

    if (accessType === "with-access" && !email) {
      return { success: false, message: "Para invitar con acceso, el correo es obligatorio." };
    }

    const payload = {
      workspace_id: activeWorkspace.workspaceId,
      profile_id: null,
      display_name: displayName,
      slug,
      title: normalizeNullable(formData.get("title")),
      bio: normalizeNullable(formData.get("bio")),
      phone: normalizeNullable(formData.get("phone")),
      email,
      whatsapp: normalizeNullable(formData.get("whatsapp")),
      avatar_url: normalizeNullable(formData.get("avatarUrl")),
      is_public: formData.get("isPublic") === "on",
      is_active: true,
    };

    const { error } = await supabase.from("agents").insert(payload);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/team");

    return {
      success: true,
      message:
        accessType === "with-access"
          ? "Asesor creado con acceso básico preparado. Falta completar el alta de acceso más adelante."
          : "Asesor creado correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo crear el asesor.",
    };
  }
}

export async function upsertAgentProfileAction(
  _prevState: AgentProfileState = INITIAL_AGENT_PROFILE_STATE,
  formData: FormData,
): Promise<AgentProfileState> {
  try {
    const profileId = formData.get("profileId")?.toString();
    const standaloneAgentId = formData.get("agentId")?.toString();

    if (!profileId && !standaloneAgentId) {
      return { success: false, message: "Falta identificar al asesor que quieres editar." };
    }

    if (profileId) {
      const { supabase, activeWorkspace, profile, existingAgent } = await getTeamMemberProfileContext(profileId);
      const displayName = formData.get("displayName")?.toString().trim() || profile.full_name?.trim() || profile.email?.trim() || "Asesor";
      const slugBase = formData.get("slug")?.toString().trim() || displayName;
      const slug = slugify(slugBase);

      if (displayName.length < 3) {
        return { success: false, message: "El nombre público debe tener al menos 3 caracteres." };
      }

      if (slug.length < 3) {
        return { success: false, message: "El slug del perfil comercial debe tener al menos 3 caracteres." };
      }

      const payload = {
        workspace_id: activeWorkspace.workspaceId,
        profile_id: profileId,
        display_name: displayName,
        slug,
        title: normalizeNullable(formData.get("title")),
        bio: normalizeNullable(formData.get("bio")),
        phone: normalizeNullable(formData.get("phone")) ?? profile.phone ?? null,
        email: normalizeNullable(formData.get("email")) ?? profile.email ?? null,
        whatsapp: normalizeNullable(formData.get("whatsapp")),
        avatar_url: normalizeNullable(formData.get("avatarUrl")) ?? profile.avatar_url ?? null,
        is_public: formData.get("isPublic") === "on",
        is_active: true,
      };

      if (existingAgent?.id) {
        const { error } = await supabase.from("agents").update(payload).eq("id", existingAgent.id).eq("workspace_id", activeWorkspace.workspaceId);
        if (error) return { success: false, message: error.message };
      } else {
        const { error } = await supabase.from("agents").insert(payload);
        if (error) return { success: false, message: error.message };
      }

      revalidatePath("/admin");
      revalidatePath("/admin/team");
      return {
        success: true,
        message: existingAgent?.id ? "Perfil comercial actualizado correctamente." : "Perfil comercial activado correctamente.",
      };
    }

    const { supabase, activeWorkspace } = await getWorkspaceContext();
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, display_name, email, phone, avatar_url")
      .eq("id", standaloneAgentId)
      .eq("workspace_id", activeWorkspace.workspaceId)
      .maybeSingle();

    if (agentError) throw agentError;
    if (!agent) return { success: false, message: "No encontramos ese asesor en el workspace activo." };

    const displayName = formData.get("displayName")?.toString().trim() || agent.display_name || "Asesor";
    const slugBase = formData.get("slug")?.toString().trim() || displayName;
    const slug = slugify(slugBase);

    if (displayName.length < 3) return { success: false, message: "El nombre público debe tener al menos 3 caracteres." };
    if (slug.length < 3) return { success: false, message: "El slug del perfil comercial debe tener al menos 3 caracteres." };

    const { error } = await supabase
      .from("agents")
      .update({
        display_name: displayName,
        slug,
        title: normalizeNullable(formData.get("title")),
        bio: normalizeNullable(formData.get("bio")),
        phone: normalizeNullable(formData.get("phone")) ?? agent.phone ?? null,
        email: normalizeNullable(formData.get("email")) ?? agent.email ?? null,
        whatsapp: normalizeNullable(formData.get("whatsapp")),
        avatar_url: normalizeNullable(formData.get("avatarUrl")) ?? agent.avatar_url ?? null,
        is_public: formData.get("isPublic") === "on",
        is_active: true,
      })
      .eq("id", agent.id)
      .eq("workspace_id", activeWorkspace.workspaceId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/team");
    revalidatePath("/admin/public/agents");
    return { success: true, message: "Asesor actualizado correctamente." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "No se pudo guardar el perfil comercial.",
    };
  }
}

export async function createPropertyAction(
  _prevState: PropertyFormState = INITIAL_STATE,
  formData: FormData,
): Promise<PropertyFormState> {
  try {
    const { supabase, activeWorkspace, user, agentRecord } = await getWorkspaceContext();
    const title = formData.get("title")?.toString().trim() ?? "";
    const locationLabel = formData.get("locationLabel")?.toString().trim() ?? "";
    const propertyType = formData.get("propertyType")?.toString() ?? "house";
    const operationType = formData.get("operationType")?.toString() ?? "sale";
    const status = formData.get("status")?.toString() ?? "draft";

    if (activeWorkspace.role === "staff" && !agentRecord?.id) {
      return { success: false, message: "Tu rol actual no puede crear propiedades si no tienes perfil comercial activo." };
    }

    if (!canManageFullInventory(activeWorkspace.role) && !agentRecord?.id) {
      return { success: false, message: "Necesitas un perfil comercial de agente activo para crear propiedades en este workspace." };
    }

    if (title.length < 4) {
      return { success: false, message: "El título debe tener al menos 4 caracteres." };
    }

    if (locationLabel.length < 3) {
      return { success: false, message: "La ubicación corta es obligatoria." };
    }

    const payload = {
      workspace_id: activeWorkspace.workspaceId,
      created_by: user.id,
      agent_id: getAllowedAgentId({
        requestedAgentId: normalizeNullable(formData.get("agentId")),
        activeRole: activeWorkspace.role,
        ownAgentId: agentRecord?.id ?? null,
      }),
      title,
      slug: slugify(formData.get("slug")?.toString() || title),
      public_code: normalizeNullable(formData.get("publicCode")),
      description: normalizeNullable(formData.get("description")),
      property_type: propertyType,
      status: canArchiveOrCloseProperty(activeWorkspace.role) ? status : status === "active" ? "active" : "draft",
      operation_type: operationType,
      is_featured: formData.get("isFeatured") === "on",
      location_label: locationLabel,
      address_line: normalizeNullable(formData.get("addressLine")),
      neighborhood: normalizeNullable(formData.get("neighborhood")),
      city: normalizeNullable(formData.get("city")),
      state: normalizeNullable(formData.get("state")),
      country_code: (formData.get("countryCode")?.toString().trim() || "MX").toUpperCase(),
      price_amount: normalizeNumber(formData.get("priceAmount")),
      currency_code: (formData.get("currencyCode")?.toString().trim() || "MXN").toUpperCase(),
      bedrooms: normalizeNumber(formData.get("bedrooms")),
      bathrooms: normalizeNumber(formData.get("bathrooms")),
      parking_spots: normalizeNumber(formData.get("parkingSpots")),
      lot_area_m2: normalizeNumber(formData.get("lotAreaM2")),
      construction_area_m2: normalizeNumber(formData.get("constructionAreaM2")),
      published_at: status === "active" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("properties").insert(payload);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    return { success: true, message: "Propiedad creada correctamente." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "No se pudo crear la propiedad." };
  }
}

export async function updatePropertyAction(
  _prevState: PropertyFormState = INITIAL_STATE,
  formData: FormData,
): Promise<PropertyFormState> {
  try {
    const propertyId = formData.get("propertyId")?.toString();
    const title = formData.get("title")?.toString().trim() ?? "";
    const locationLabel = formData.get("locationLabel")?.toString().trim() ?? "";
    const status = formData.get("status")?.toString() ?? "draft";

    if (!propertyId) {
      return { success: false, message: "Falta identificar la propiedad a editar." };
    }

    const { supabase, activeWorkspace, agentRecord, canEditProperty, isFullAccessRole } = await getPropertyAccessContext(propertyId);

    if (!canEditProperty) {
      return { success: false, message: "Solo puedes editar propiedades asignadas a ti dentro de este workspace." };
    }

    if (title.length < 4) {
      return { success: false, message: "El título debe tener al menos 4 caracteres." };
    }

    if (locationLabel.length < 3) {
      return { success: false, message: "La ubicación corta es obligatoria." };
    }

    const payload = {
      workspace_id: activeWorkspace.workspaceId,
      agent_id: getAllowedAgentId({
        requestedAgentId: normalizeNullable(formData.get("agentId")),
        activeRole: activeWorkspace.role,
        ownAgentId: agentRecord?.id ?? null,
      }),
      title,
      slug: slugify(formData.get("slug")?.toString() || title),
      public_code: normalizeNullable(formData.get("publicCode")),
      description: normalizeNullable(formData.get("description")),
      property_type: formData.get("propertyType")?.toString() ?? "house",
      status: isFullAccessRole ? status : status === "active" ? "active" : "draft",
      operation_type: formData.get("operationType")?.toString() ?? "sale",
      is_featured: formData.get("isFeatured") === "on",
      location_label: locationLabel,
      address_line: normalizeNullable(formData.get("addressLine")),
      neighborhood: normalizeNullable(formData.get("neighborhood")),
      city: normalizeNullable(formData.get("city")),
      state: normalizeNullable(formData.get("state")),
      country_code: (formData.get("countryCode")?.toString().trim() || "MX").toUpperCase(),
      price_amount: normalizeNumber(formData.get("priceAmount")),
      currency_code: (formData.get("currencyCode")?.toString().trim() || "MXN").toUpperCase(),
      bedrooms: normalizeNumber(formData.get("bedrooms")),
      bathrooms: normalizeNumber(formData.get("bathrooms")),
      parking_spots: normalizeNumber(formData.get("parkingSpots")),
      lot_area_m2: normalizeNumber(formData.get("lotAreaM2")),
      construction_area_m2: normalizeNumber(formData.get("constructionAreaM2")),
      published_at: status === "active" ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", propertyId)
      .eq("workspace_id", activeWorkspace.workspaceId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${propertyId}`);
    return { success: true, message: "Propiedad actualizada correctamente." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "No se pudo actualizar la propiedad." };
  }
}

export async function updatePropertyStatusAction(formData: FormData) {
  const propertyId = formData.get("propertyId")?.toString();
  const status = formData.get("status")?.toString();

  if (!propertyId || !status) {
    throw new Error("Faltan datos para cambiar el estatus.");
  }

  const { supabase, activeWorkspace, canEditProperty, isFullAccessRole } = await getPropertyAccessContext(propertyId);

  if (!canEditProperty) {
    throw new Error("No tienes permiso para cambiar el estatus de esta propiedad.");
  }

  if (!isFullAccessRole && ["archived", "sold", "rented"].includes(status)) {
    throw new Error("Ese cambio de estatus solo puede hacerlo un owner o admin.");
  }

  const { error } = await supabase
    .from("properties")
    .update({
      status,
      published_at: status === "active" ? new Date().toISOString() : null,
    })
    .eq("id", propertyId)
    .eq("workspace_id", activeWorkspace.workspaceId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function addPropertyImageAction(formData: FormData) {
  const { supabase, activeWorkspace } = await getWorkspaceContext();
  const propertyId = formData.get("propertyId")?.toString();
  const storagePath = formData.get("storagePath")?.toString().trim();

  if (!propertyId || !storagePath) {
    throw new Error("Faltan datos para registrar la imagen.");
  }

  const sortOrder = normalizeNumber(formData.get("sortOrder")) ?? 0;
  const isCover = formData.get("isCover") === "on";

  const { error } = await supabase.from("property_images").insert({
    workspace_id: activeWorkspace.workspaceId,
    property_id: propertyId,
    storage_path: storagePath,
    alt_text: normalizeNullable(formData.get("altText")),
    sort_order: sortOrder,
    is_cover: isCover,
  });

  if (error) throw error;

  revalidatePath("/admin");
}

export async function updatePropertyImagesAction(formData: FormData) {
  const propertyId = formData.get("propertyId")?.toString();
  const imagesRaw = formData.get("images")?.toString();

  if (!propertyId || !imagesRaw) {
    throw new Error("Faltan datos para actualizar las fotos.");
  }

  const { supabase, activeWorkspace, canEditProperty } = await getPropertyAccessContext(propertyId);

  if (!canEditProperty) {
    throw new Error("No tienes permiso para actualizar las fotos de esta propiedad.");
  }

  let images: Array<{
    id?: string;
    storage_path: string;
    alt_text?: string | null;
    sort_order: number;
    is_cover: boolean;
  }> = [];

  try {
    images = JSON.parse(imagesRaw);
  } catch {
    throw new Error("No se pudo leer la galería enviada.");
  }

  const normalizedImages = images
    .filter((image) => image.storage_path?.trim())
    .map((image, index) => ({
      workspace_id: activeWorkspace.workspaceId,
      property_id: propertyId,
      storage_bucket: "property-images",
      storage_path: image.storage_path.trim(),
      alt_text: image.alt_text?.trim() ? image.alt_text.trim() : null,
      sort_order: index,
      is_cover: image.is_cover === true,
    }));

  if (!normalizedImages.length) {
    throw new Error("Necesitas al menos una foto para guardar la galería.");
  }

  const coverIndex = normalizedImages.findIndex((image) => image.is_cover);
  const finalImages = normalizedImages.map((image, index) => ({
    ...image,
    is_cover: coverIndex === -1 ? index === 0 : index === coverIndex,
  }));

  const { error: deleteError } = await supabase
    .from("property_images")
    .delete()
    .eq("property_id", propertyId)
    .eq("workspace_id", activeWorkspace.workspaceId);

  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from("property_images").insert(finalImages);

  if (insertError) throw insertError;

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function deletePropertyImageAction(formData: FormData) {
  const { supabase, activeWorkspace } = await getWorkspaceContext();
  const imageId = formData.get("imageId")?.toString();
  const storagePath = formData.get("storagePath")?.toString();

  if (!imageId) {
    throw new Error("Falta identificar la imagen.");
  }

  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId)
    .eq("workspace_id", activeWorkspace.workspaceId);

  if (error) throw error;

  if (storagePath) {
    await supabase.storage.from("property-images").remove([storagePath]);
  }

  revalidatePath("/admin");
}
