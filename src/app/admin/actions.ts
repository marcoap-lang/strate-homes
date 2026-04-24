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

const INITIAL_STATE: PropertyFormState = {
  success: false,
  message: "",
};

const INITIAL_BOOTSTRAP_STATE: BootstrapOwnerState = {
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

  return { supabase, activeWorkspace };
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

export async function createPropertyAction(
  _prevState: PropertyFormState = INITIAL_STATE,
  formData: FormData,
): Promise<PropertyFormState> {
  try {
    const { supabase, activeWorkspace } = await getWorkspaceContext();
    const title = formData.get("title")?.toString().trim() ?? "";
    const locationLabel = formData.get("locationLabel")?.toString().trim() ?? "";
    const propertyType = formData.get("propertyType")?.toString() ?? "house";
    const operationType = formData.get("operationType")?.toString() ?? "sale";
    const status = formData.get("status")?.toString() ?? "draft";

    if (title.length < 4) {
      return { success: false, message: "El título debe tener al menos 4 caracteres." };
    }

    if (locationLabel.length < 3) {
      return { success: false, message: "La ubicación corta es obligatoria." };
    }

    const payload = {
      workspace_id: activeWorkspace.workspaceId,
      agent_id: normalizeNullable(formData.get("agentId")),
      title,
      slug: slugify(formData.get("slug")?.toString() || title),
      public_code: normalizeNullable(formData.get("publicCode")),
      description: normalizeNullable(formData.get("description")),
      property_type: propertyType,
      status,
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
    const { supabase, activeWorkspace } = await getWorkspaceContext();
    const propertyId = formData.get("propertyId")?.toString();
    const title = formData.get("title")?.toString().trim() ?? "";
    const locationLabel = formData.get("locationLabel")?.toString().trim() ?? "";
    const status = formData.get("status")?.toString() ?? "draft";

    if (!propertyId) {
      return { success: false, message: "Falta identificar la propiedad a editar." };
    }

    if (title.length < 4) {
      return { success: false, message: "El título debe tener al menos 4 caracteres." };
    }

    if (locationLabel.length < 3) {
      return { success: false, message: "La ubicación corta es obligatoria." };
    }

    const payload = {
      workspace_id: activeWorkspace.workspaceId,
      agent_id: normalizeNullable(formData.get("agentId")),
      title,
      slug: slugify(formData.get("slug")?.toString() || title),
      public_code: normalizeNullable(formData.get("publicCode")),
      description: normalizeNullable(formData.get("description")),
      property_type: formData.get("propertyType")?.toString() ?? "house",
      status,
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
    return { success: true, message: "Propiedad actualizada correctamente." };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "No se pudo actualizar la propiedad." };
  }
}

export async function updatePropertyStatusAction(formData: FormData) {
  const { supabase, activeWorkspace } = await getWorkspaceContext();
  const propertyId = formData.get("propertyId")?.toString();
  const status = formData.get("status")?.toString();

  if (!propertyId || !status) {
    throw new Error("Faltan datos para cambiar el estatus.");
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

export async function deletePropertyImageAction(formData: FormData) {
  const { supabase, activeWorkspace } = await getWorkspaceContext();
  const imageId = formData.get("imageId")?.toString();

  if (!imageId) {
    throw new Error("Falta identificar la imagen.");
  }

  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId)
    .eq("workspace_id", activeWorkspace.workspaceId);

  if (error) throw error;

  revalidatePath("/admin");
}
