"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPlatformAdmin } from "@/lib/platform-admin";

type PlatformActionState = {
  success: boolean;
  message: string;
};

const ok = (message: string): PlatformActionState => ({ success: true, message });
const fail = (message: string): PlatformActionState => ({ success: false, message });

function normalizeNullable(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text ? text : null;
}

function normalizeDateTime(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeJson(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

async function recordPlatformEvent({
  workspaceId,
  eventType,
  entityType,
  entityId,
  metadata = {},
}: {
  workspaceId?: string | null;
  eventType: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { supabase, user } = await assertPlatformAdmin();
  await supabase.from("activity_events").insert({
    workspace_id: workspaceId ?? null,
    actor_profile_id: user.id,
    event_type: eventType,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata,
  });
}

function revalidatePlatform(workspaceId?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/admin/activity");
  if (workspaceId) revalidatePath(`/admin/workspaces/${workspaceId}`);
}

export async function updateWorkspaceSubscriptionAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const plan = formData.get("plan")?.toString();
    const status = formData.get("status")?.toString();
    const commercialStatus = formData.get("commercialStatus")?.toString();

    if (!workspaceId || !plan || !status || !commercialStatus) return fail("Faltan datos para actualizar la suscripción.");

    const payload = {
      workspace_id: workspaceId,
      plan,
      status,
      commercial_status: commercialStatus,
      trial_ends_at: normalizeDateTime(formData.get("trialEndsAt")),
      current_period_ends_at: normalizeDateTime(formData.get("currentPeriodEndsAt")),
      external_customer_id: normalizeNullable(formData.get("externalCustomerId")),
    };

    const { error } = await supabase.from("workspace_subscriptions").upsert(payload, { onConflict: "workspace_id" });
    if (error) return fail(error.message);

    await recordPlatformEvent({
      workspaceId,
      eventType: "subscription_updated",
      entityType: "workspace_subscription",
      entityId: workspaceId,
      metadata: { plan, status, commercial_status: commercialStatus },
    });

    revalidatePlatform(workspaceId);
    return ok("Suscripción actualizada.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo actualizar la suscripción.");
  }
}

export async function createWorkspaceNoteAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase, user } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const body = normalizeNullable(formData.get("body"));
    if (!workspaceId || !body) return fail("Escribe una nota interna.");

    const { data, error } = await supabase
      .from("workspace_admin_notes")
      .insert({ workspace_id: workspaceId, author_profile_id: user.id, body })
      .select("id")
      .single();

    if (error) return fail(error.message);

    await recordPlatformEvent({
      workspaceId,
      eventType: "workspace_note_created",
      entityType: "workspace_admin_note",
      entityId: data?.id ?? null,
      metadata: { preview: body.slice(0, 120) },
    });

    revalidatePlatform(workspaceId);
    return ok("Nota interna agregada.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo agregar la nota.");
  }
}

export async function createWorkspaceFollowupAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const title = normalizeNullable(formData.get("title"));
    if (!workspaceId || !title) return fail("Escribe el seguimiento pendiente.");

    const { data, error } = await supabase
      .from("workspace_followups")
      .insert({
        workspace_id: workspaceId,
        assigned_profile_id: normalizeNullable(formData.get("assignedProfileId")),
        title,
        due_at: normalizeDateTime(formData.get("dueAt")),
        status: "open",
      })
      .select("id")
      .single();

    if (error) return fail(error.message);

    await recordPlatformEvent({
      workspaceId,
      eventType: "workspace_followup_created",
      entityType: "workspace_followup",
      entityId: data?.id ?? null,
      metadata: { title },
    });

    revalidatePlatform(workspaceId);
    return ok("Seguimiento creado.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo crear el seguimiento.");
  }
}

export async function completeWorkspaceFollowupAction(formData: FormData) {
  const { supabase } = await assertPlatformAdmin();
  const workspaceId = formData.get("workspaceId")?.toString();
  const followupId = formData.get("followupId")?.toString();
  if (!workspaceId || !followupId) throw new Error("Faltan datos del seguimiento.");

  const { error } = await supabase
    .from("workspace_followups")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", followupId)
    .eq("workspace_id", workspaceId);

  if (error) throw error;

  await recordPlatformEvent({
    workspaceId,
    eventType: "workspace_followup_completed",
    entityType: "workspace_followup",
    entityId: followupId,
  });

  revalidatePlatform(workspaceId);
}

export async function updateWorkspaceStatusAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const isActive = formData.get("isActive") === "true";
    const confirm = formData.get("confirm")?.toString().trim().toUpperCase();
    if (!workspaceId || confirm !== "CONFIRMAR") return fail("Escribe CONFIRMAR para cambiar el estatus del workspace.");

    const { error } = await supabase.from("workspaces").update({ is_active: isActive }).eq("id", workspaceId);
    if (error) return fail(error.message);

    await recordPlatformEvent({
      workspaceId,
      eventType: "workspace_status_updated",
      entityType: "workspace",
      entityId: workspaceId,
      metadata: { is_active: isActive },
    });

    revalidatePlatform(workspaceId);
    return ok(isActive ? "Workspace reactivado." : "Workspace pausado.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo cambiar el estatus.");
  }
}

export async function deleteWorkspaceAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  let deleted = false;

  try {
    const { supabase } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const confirm = formData.get("confirm")?.toString().trim().toUpperCase();

    if (!workspaceId || confirm !== "ELIMINAR") return fail("Escribe ELIMINAR para borrar esta organización.");

    const { data, error } = await supabase.rpc("delete_workspace_as_platform_admin", {
      target_workspace_id: workspaceId,
    });
    if (error) return fail(error.message);

    const result = isRecord(data) ? data : {};
    if (result.deleted !== true) return fail("No se eliminó la organización. Puede que ya no exista o falte aplicar la migración.");

    await recordPlatformEvent({
      eventType: "workspace_deleted",
      entityType: "workspace",
      entityId: workspaceId,
      metadata: {
        name: typeof result.name === "string" ? result.name : null,
        slug: typeof result.slug === "string" ? result.slug : null,
      },
    });

    revalidatePlatform();
    deleted = true;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo eliminar la organización.");
  }

  if (deleted) redirect("/admin");
  return ok("Organización eliminada.");
}

export async function changeWorkspaceOwnerAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const newOwnerProfileId = formData.get("newOwnerProfileId")?.toString();
    if (!workspaceId || !newOwnerProfileId) return fail("Selecciona un miembro activo como nuevo owner.");

    const { data: member, error: memberError } = await supabase
      .from("workspace_members")
      .select("id, profile_id, is_active")
      .eq("workspace_id", workspaceId)
      .eq("profile_id", newOwnerProfileId)
      .eq("is_active", true)
      .maybeSingle();

    if (memberError) return fail(memberError.message);
    if (!member) return fail("El nuevo owner debe ser miembro activo de la inmobiliaria.");

    const { error: demoteError } = await supabase
      .from("workspace_members")
      .update({ role: "admin" })
      .eq("workspace_id", workspaceId)
      .eq("role", "owner");

    if (demoteError) return fail(demoteError.message);

    const { error: promoteError } = await supabase
      .from("workspace_members")
      .update({ role: "owner" })
      .eq("workspace_id", workspaceId)
      .eq("profile_id", newOwnerProfileId);

    if (promoteError) return fail(promoteError.message);

    await recordPlatformEvent({
      workspaceId,
      eventType: "workspace_owner_changed",
      entityType: "workspace",
      entityId: workspaceId,
      metadata: { new_owner_profile_id: newOwnerProfileId },
    });

    revalidatePlatform(workspaceId);
    return ok("Owner actualizado.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo cambiar el owner.");
  }
}

export async function updateWorkspaceFeatureFlagAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase } = await assertPlatformAdmin();
    const workspaceId = formData.get("workspaceId")?.toString();
    const flagKey = normalizeNullable(formData.get("flagKey"));
    if (!workspaceId || !flagKey) return fail("Define una feature flag válida.");

    const enabled = formData.get("enabled") === "on";
    const metadata = normalizeJson(formData.get("metadata"));
    const { error } = await supabase.from("workspace_feature_flags").upsert({
      workspace_id: workspaceId,
      flag_key: flagKey,
      enabled,
      metadata,
      updated_at: new Date().toISOString(),
    }, { onConflict: "workspace_id,flag_key" });

    if (error) return fail(error.message);

    await recordPlatformEvent({
      workspaceId,
      eventType: "feature_flag_updated",
      entityType: "workspace_feature_flag",
      entityId: workspaceId,
      metadata: { flag_key: flagKey, enabled },
    });

    revalidatePlatform(workspaceId);
    return ok("Feature flag actualizada.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo actualizar la feature flag.");
  }
}

export async function createAnnouncementAction(_prevState: PlatformActionState, formData: FormData): Promise<PlatformActionState> {
  try {
    const { supabase } = await assertPlatformAdmin();
    const title = normalizeNullable(formData.get("title"));
    const body = normalizeNullable(formData.get("body"));
    if (!title || !body) return fail("Completa título y mensaje del anuncio.");

    const { data, error } = await supabase
      .from("platform_announcements")
      .insert({
        title,
        body,
        audience: formData.get("audience")?.toString() || "all",
        is_active: formData.get("isActive") === "on",
        starts_at: normalizeDateTime(formData.get("startsAt")),
        ends_at: normalizeDateTime(formData.get("endsAt")),
      })
      .select("id")
      .single();

    if (error) return fail(error.message);

    await recordPlatformEvent({
      eventType: "announcement_created",
      entityType: "platform_announcement",
      entityId: data?.id ?? null,
      metadata: { title },
    });

    revalidatePlatform();
    return ok("Anuncio creado.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "No se pudo crear el anuncio.");
  }
}

export async function toggleAnnouncementAction(formData: FormData) {
  const { supabase } = await assertPlatformAdmin();
  const announcementId = formData.get("announcementId")?.toString();
  const isActive = formData.get("isActive") === "true";
  if (!announcementId) throw new Error("Falta el anuncio.");

  const { error } = await supabase
    .from("platform_announcements")
    .update({ is_active: isActive })
    .eq("id", announcementId);

  if (error) throw error;

  await recordPlatformEvent({
    eventType: "announcement_updated",
    entityType: "platform_announcement",
    entityId: announcementId,
    metadata: { is_active: isActive },
  });

  revalidatePlatform();
}
