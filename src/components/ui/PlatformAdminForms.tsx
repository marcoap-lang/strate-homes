"use client";

import { useActionState } from "react";
import {
  changeWorkspaceOwnerAction,
  completeWorkspaceFollowupAction,
  createAnnouncementAction,
  createWorkspaceFollowupAction,
  createWorkspaceNoteAction,
  deleteWorkspaceAction,
  toggleAnnouncementAction,
  updateWorkspaceFeatureFlagAction,
  updateWorkspaceStatusAction,
  updateWorkspaceSubscriptionAction,
} from "@/app/admin/platform-actions";
import type { PlatformFollowup, PlatformMember, PlatformSubscription } from "@/lib/platform-admin";

const initialState = { success: false, message: "" };

function ActionMessage({ state }: { state: typeof initialState }) {
  if (!state.message) return null;
  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
      {state.message}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400";
const buttonClass = "rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c99a46] disabled:opacity-60";

function formatDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function SubscriptionForm({ workspaceId, subscription }: { workspaceId: string; subscription: PlatformSubscription }) {
  const [state, action, pending] = useActionState(updateWorkspaceSubscriptionAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="rounded-2xl border border-[#d7ab5b]/30 bg-[#fff8ec] px-4 py-3 text-sm leading-6 text-slate-700">
        Define aquí el tipo de cuenta del cliente. Por ahora el cobro puede permanecer en $0; el plan solo controla la capacidad de asesores y usuarios internos.
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tipo de cuenta">
          <select name="plan" defaultValue={subscription.plan} className={inputClass}>
            <option value="solo">Solo asesor</option>
            <option value="small_agency">Inmobiliaria pequeña</option>
            <option value="agency">Agencia</option>
          </select>
        </Field>
        <Field label="Estado de cuenta">
          <select name="status" defaultValue={subscription.status} className={inputClass}>
            <option value="trial">Trial</option>
            <option value="active">Activa</option>
            <option value="past_due">Vencida</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </Field>
        <Field label="Estado comercial">
          <select name="commercialStatus" defaultValue={subscription.commercial_status} className={inputClass}>
            <option value="prospect">Prospecto</option>
            <option value="demo">Demo</option>
            <option value="customer">Cliente</option>
            <option value="risk">Riesgo</option>
            <option value="churn">Churn</option>
          </select>
        </Field>
        <Field label="Customer externo">
          <input name="externalCustomerId" defaultValue={subscription.external_customer_id ?? ""} className={inputClass} placeholder="Stripe/manual ID opcional" />
        </Field>
        <Field label="Fin de trial">
          <input name="trialEndsAt" type="datetime-local" defaultValue={formatDateTimeInput(subscription.trial_ends_at)} className={inputClass} />
        </Field>
        <Field label="Fin de periodo">
          <input name="currentPeriodEndsAt" type="datetime-local" defaultValue={formatDateTimeInput(subscription.current_period_ends_at)} className={inputClass} />
        </Field>
      </div>
      <ActionMessage state={state} />
      <button disabled={pending} className={buttonClass}>{pending ? "Guardando..." : "Guardar plan"}</button>
    </form>
  );
}

export function WorkspaceNoteForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(createWorkspaceNoteAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Field label="Nueva nota interna">
        <textarea name="body" rows={4} className={inputClass} placeholder="Contexto comercial, riesgos, acuerdos o siguiente paso." />
      </Field>
      <ActionMessage state={state} />
      <button disabled={pending} className={buttonClass}>{pending ? "Guardando..." : "Agregar nota"}</button>
    </form>
  );
}

export function WorkspaceFollowupForm({ workspaceId, platformAdmins }: { workspaceId: string; platformAdmins: PlatformMember[] }) {
  const [state, action, pending] = useActionState(createWorkspaceFollowupAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Field label="Seguimiento">
        <input name="title" className={inputClass} placeholder="Ej. revisar demo con Marco" />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Responsable interno">
          <select name="assignedProfileId" className={inputClass} defaultValue="">
            <option value="">Sin asignar</option>
            {platformAdmins.map((admin) => (
              <option key={admin.profile_id} value={admin.profile_id}>{admin.full_name ?? admin.email ?? admin.profile_id}</option>
            ))}
          </select>
        </Field>
        <Field label="Fecha">
          <input name="dueAt" type="datetime-local" className={inputClass} />
        </Field>
      </div>
      <ActionMessage state={state} />
      <button disabled={pending} className={buttonClass}>{pending ? "Creando..." : "Crear seguimiento"}</button>
    </form>
  );
}

export function CompleteFollowupButton({ workspaceId, followup }: { workspaceId: string; followup: PlatformFollowup }) {
  if (followup.status !== "open") return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Completado</span>;

  return (
    <form action={completeWorkspaceFollowupAction}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="followupId" value={followup.id} />
      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50">Completar</button>
    </form>
  );
}

export function WorkspaceStatusForm({ workspaceId, isActive }: { workspaceId: string; isActive: boolean }) {
  const [state, action, pending] = useActionState(updateWorkspaceStatusAction, initialState);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <p className="text-sm font-semibold text-amber-950">{isActive ? "Pausar workspace" : "Reactivar workspace"}</p>
      <p className="text-xs leading-5 text-amber-800">Escribe CONFIRMAR para ejecutar esta acción sensible.</p>
      <input name="confirm" className={inputClass} placeholder="CONFIRMAR" />
      <ActionMessage state={state} />
      <button disabled={pending} className="rounded-full bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800">
        {isActive ? "Pausar" : "Reactivar"}
      </button>
    </form>
  );
}

export function WorkspaceDeleteForm({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const [state, action, pending] = useActionState(deleteWorkspaceAction, initialState);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <p className="text-sm font-semibold text-rose-950">Eliminar organización</p>
      <p className="text-xs leading-5 text-rose-800">
        Borra {workspaceName} y su información operativa relacionada. Úsalo solo para cuentas basura o pruebas iniciales.
      </p>
      <input name="confirm" className={inputClass} placeholder="ELIMINAR" />
      <ActionMessage state={state} />
      <button disabled={pending} className="rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800">
        {pending ? "Eliminando..." : "Eliminar organización"}
      </button>
    </form>
  );
}

export function OwnerChangeForm({ workspaceId, members }: { workspaceId: string; members: PlatformMember[] }) {
  const [state, action, pending] = useActionState(changeWorkspaceOwnerAction, initialState);
  const activeMembers = members.filter((member) => member.is_active);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Field label="Nuevo owner">
        <select name="newOwnerProfileId" className={inputClass} defaultValue="">
          <option value="">Seleccionar miembro activo</option>
          {activeMembers.map((member) => (
            <option key={member.profile_id} value={member.profile_id}>{member.full_name ?? member.email ?? member.profile_id}</option>
          ))}
        </select>
      </Field>
      <ActionMessage state={state} />
      <button disabled={pending} className={buttonClass}>{pending ? "Cambiando..." : "Cambiar owner"}</button>
    </form>
  );
}

export function FeatureFlagForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(updateWorkspaceFeatureFlagAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <Field label="Flag key">
          <input name="flagKey" className={inputClass} placeholder="premium_public_site" />
        </Field>
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" name="enabled" />
          Activa
        </label>
      </div>
      <Field label="Metadata JSON opcional">
        <textarea name="metadata" rows={3} className={inputClass} placeholder='{"variant":"a"}' />
      </Field>
      <ActionMessage state={state} />
      <button disabled={pending} className={buttonClass}>{pending ? "Guardando..." : "Guardar flag"}</button>
    </form>
  );
}

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(createAnnouncementAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <Field label="Título">
        <input name="title" className={inputClass} />
      </Field>
      <Field label="Mensaje">
        <textarea name="body" rows={3} className={inputClass} />
      </Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Audiencia">
          <select name="audience" className={inputClass} defaultValue="all">
            <option value="all">Todas</option>
            <option value="trial">Trial</option>
            <option value="active">Activas</option>
            <option value="past_due">Vencidas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </Field>
        <Field label="Inicio">
          <input name="startsAt" type="datetime-local" className={inputClass} />
        </Field>
        <Field label="Fin">
          <input name="endsAt" type="datetime-local" className={inputClass} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isActive" />
        Publicar como activo
      </label>
      <ActionMessage state={state} />
      <button disabled={pending} className={buttonClass}>{pending ? "Creando..." : "Crear anuncio"}</button>
    </form>
  );
}

export function AnnouncementToggleForm({ announcementId, isActive }: { announcementId: string; isActive: boolean }) {
  return (
    <form action={toggleAnnouncementAction}>
      <input type="hidden" name="announcementId" value={announcementId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
        {isActive ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}
