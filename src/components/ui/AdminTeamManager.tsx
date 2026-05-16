"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { createAgentAction, deleteAgentAction, upsertAgentProfileAction, type AgentProfileState, type CreateAgentState, type DeleteAgentState } from "@/app/admin/actions";
import type { StandaloneAgentRecord, TeamMemberRecord } from "@/lib/admin-types";
import { AgentAvatarUploadField } from "@/components/ui/AgentAvatarUploadField";

const initialProfileState: AgentProfileState = { success: false, message: "" };
const initialCreateState: CreateAgentState = { success: false, message: "" };
const initialDeleteState: DeleteAgentState = { success: false, message: "" };

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "staff") return "Staff";
  if (role === "agent") return "Agent (legacy)";
  return role;
}

function getCommercialProfileSummary(member: TeamMemberRecord) {
  if (!member.agent_profile) {
    return {
      tone: "border-amber-200 bg-amber-50 text-amber-700",
      label: "Sin perfil comercial",
    };
  }

  return member.agent_profile.is_public
    ? {
        tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
        label: "Perfil comercial público",
      }
    : {
        tone: "border-slate-200 bg-slate-100 text-slate-600",
        label: "Perfil comercial interno",
      };
}

function NewAgentForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createAgentAction, initialCreateState);

  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Perfiles comerciales</p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-950">Nuevo asesor comercial</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
            Crea perfiles comerciales para asignar propiedades, repartir visibilidad pública y construir la página personal de cada asesor.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm sm:w-auto font-medium text-white transition hover:bg-[#c99a46]"
        >
          {open ? "Cerrar" : "Nuevo asesor"}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="accessType" value="public-only" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre público</span>
              <input name="displayName" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug</span>
              <input name="slug" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Especialidad</span>
              <input name="title" placeholder="Ej. Residencial premium en zona norte" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700 md:col-span-2">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Bio corta</span>
              <textarea name="bio" rows={3} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo</span>
              <input name="email" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Teléfono</span>
              <input name="phone" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">WhatsApp</span>
              <input name="whatsapp" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Foto</span>
              <input name="avatarUrl" placeholder="https://..." className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" name="isPublic" defaultChecked className="size-4 rounded border-stone-300 bg-white" />
            Mostrar perfil en el sitio público
          </label>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
            Este bloque crea solo el perfil comercial. El acceso al sistema se gestiona por separado desde usuarios internos.
          </div>

          {state.message ? (
            <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {state.message}
            </p>
          ) : null}

          <button disabled={pending} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm sm:w-auto font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {pending ? "Guardando..." : "Crear perfil comercial"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function AgentProfileEditor({ member, workspaceId }: { member: TeamMemberRecord; workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(member.agent_profile?.avatar_url ?? member.avatar_url ?? "");
  const [state, action, pending] = useActionState(upsertAgentProfileAction, initialProfileState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAgentAction, initialDeleteState);
  const profile = member.agent_profile;

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Perfil comercial vinculado</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Edita la presencia comercial de esta persona sin tocar su acceso al sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100"
        >
          {open ? "Cerrar" : profile ? "Editar perfil" : "Crear perfil"}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="profileId" value={member.profile_id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre público</span>
              <input name="displayName" defaultValue={profile?.display_name ?? member.full_name ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug</span>
              <input name="slug" defaultValue={profile?.slug ?? member.full_name ?? member.email ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Especialidad</span>
              <input name="title" defaultValue={profile?.title ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo comercial</span>
              <input name="email" defaultValue={profile?.email ?? member.email ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Teléfono</span>
              <input name="phone" defaultValue={profile?.phone ?? member.phone ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">WhatsApp</span>
              <input name="whatsapp" defaultValue={profile?.whatsapp ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

          </div>

          <AgentAvatarUploadField
            workspaceId={workspaceId}
            agentKey={member.agent_profile?.id ?? member.profile_id}
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Foto"
          />

          <label className="space-y-2 text-sm text-stone-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Bio</span>
            <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
          </label>

          <label className="inline-flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" name="isPublic" defaultChecked={profile?.is_public ?? true} className="size-4 rounded border-stone-300 bg-white" />
            Mostrar perfil comercial en el sitio público
          </label>

          {state.message ? (
            <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {state.message}
            </p>
          ) : null}

          <button disabled={pending} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm sm:w-auto font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {pending ? "Guardando..." : profile ? "Guardar perfil comercial" : "Crear perfil comercial"}
          </button>
        </form>
      ) : null}

      {profile ? (
        <form action={deleteAction} className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
          <input type="hidden" name="agentId" value={profile.id} />
          <p className="text-xs leading-5 text-rose-700">Eliminar este perfil comercial lo quita como colaborador y deja sin responsable principal las propiedades donde hoy aparezca como contacto principal.</p>
          {deleteState.message ? <p className={`mt-3 rounded-xl border px-3 py-2 text-xs ${deleteState.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-white text-rose-700"}`}>{deleteState.message}</p> : null}
          <button disabled={deletePending} className="mt-3 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
            {deletePending ? "Eliminando..." : "Eliminar perfil comercial"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function StandaloneAgentEditor({ agent, workspaceId }: { agent: StandaloneAgentRecord; workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(agent.avatar_url ?? "");
  const [state, action, pending] = useActionState(upsertAgentProfileAction, initialProfileState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAgentAction, initialDeleteState);

  return (
    <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5 shadow-sm shadow-stone-200/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-stone-950">{agent.display_name}</p>
          <p className="mt-2 text-sm text-stone-600">{agent.title ?? "Asesor comercial"}</p>
          {agent.email ? <p className="mt-3 text-sm text-stone-500">{agent.email}</p> : null}
          {agent.whatsapp ?? agent.phone ? <p className="mt-1 text-sm text-stone-500">{agent.whatsapp ?? agent.phone}</p> : null}
          <p className="mt-3 text-xs text-stone-500">Slug: {agent.slug}</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100">
          {open ? "Cerrar" : "Editar perfil"}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="agentId" value={agent.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre público</span>
              <input name="displayName" defaultValue={agent.display_name} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug</span>
              <input name="slug" defaultValue={agent.slug} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Especialidad</span>
              <input name="title" defaultValue={agent.title ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo comercial</span>
              <input name="email" defaultValue={agent.email ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Teléfono</span>
              <input name="phone" defaultValue={agent.phone ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">WhatsApp</span>
              <input name="whatsapp" defaultValue={agent.whatsapp ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
          </div>
          <AgentAvatarUploadField
            workspaceId={workspaceId}
            agentKey={agent.id}
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Foto"
          />
          <label className="space-y-2 text-sm text-stone-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Bio corta</span>
            <textarea name="bio" rows={4} defaultValue={agent.bio ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-base sm:py-3 sm:text-sm text-stone-950 outline-none transition focus:border-stone-400" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" name="isPublic" defaultChecked={agent.is_public} className="size-4 rounded border-stone-300 bg-white" />
            Mostrar perfil comercial en el sitio público
          </label>
          {state.message ? <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{state.message}</p> : null}
          <button disabled={pending} className="w-full rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm sm:w-auto font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {pending ? "Guardando..." : "Guardar perfil comercial"}
          </button>
        </form>
      ) : null}

      <form action={deleteAction} className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
        <input type="hidden" name="agentId" value={agent.id} />
        <p className="text-xs leading-5 text-rose-700">Eliminar este perfil comercial lo quita como colaborador y deja sin responsable principal las propiedades donde hoy aparezca como contacto principal.</p>
        {deleteState.message ? <p className={`mt-3 rounded-xl border px-3 py-2 text-xs ${deleteState.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-white text-rose-700"}`}>{deleteState.message}</p> : null}
        <button disabled={deletePending} className="mt-3 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
          {deletePending ? "Eliminando..." : "Eliminar perfil comercial"}
        </button>
      </form>
    </div>
  );
}

function StandaloneAgentsList({ agents, workspaceId }: { agents: StandaloneAgentRecord[]; workspaceId: string }) {
  if (!agents.length) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Perfiles comerciales externos</p>
        <h3 className="mt-2 text-2xl font-semibold text-stone-950">Asesores sin acceso al sistema</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
          Estos asesores pueden participar en propiedades y aparecer en el sitio público sin entrar al sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <StandaloneAgentEditor key={agent.id} agent={agent} workspaceId={workspaceId} />
        ))}
      </div>
    </div>
  );
}

export function AdminTeamManager({ teamMembers, standaloneAgents, workspaceId }: { teamMembers: TeamMemberRecord[]; standaloneAgents: StandaloneAgentRecord[]; workspaceId: string }) {
  const linkedCommercialProfiles = teamMembers.filter((member) => member.agent_profile).length;
  const internalOnlyUsers = teamMembers.filter((member) => !member.agent_profile).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] p-6 shadow-sm shadow-stone-200/40">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Equipo</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Usuarios internos y perfiles comerciales</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-600">
          Aquí se separa quién entra al sistema y quién atiende propiedades públicamente. Una misma persona puede ser ambas cosas, pero esa relación debe sentirse explícita.
        </p>
      </div>

      <NewAgentForm />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Usuarios del sistema</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.length}</p>
        </div>
        <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Con perfil comercial</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{linkedCommercialProfiles}</p>
        </div>
        <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Solo operación interna</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{internalOnlyUsers}</p>
        </div>
        <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Perfiles externos</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{standaloneAgents.length}</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Acceso interno</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-950">Usuarios del sistema</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Estas personas entran al admin. Pueden o no tener un perfil comercial vinculado para aparecer públicamente y recibir propiedades.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
            <p><span className="font-medium text-stone-900">Rol del sistema:</span> define permisos internos.</p>
            <p><span className="font-medium text-stone-900">Perfil comercial:</span> define presencia pública y asignación a propiedades.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
        {teamMembers.map((member) => (
          <div key={member.membership_id} className="rounded-[1.35rem] border border-stone-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5 shadow-sm shadow-stone-200/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 text-lg font-semibold text-stone-600">
                  {(member.agent_profile?.avatar_url ?? member.avatar_url) ? <Image src={member.agent_profile?.avatar_url ?? member.avatar_url ?? ""} alt={member.full_name ?? member.email ?? "Asesor"} fill className="object-cover" unoptimized /> : (member.full_name ?? member.email ?? "A").slice(0,1).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-stone-950">{member.full_name ?? member.email ?? member.profile_id}</p>
                  <p className="mt-1 text-sm text-stone-500">{member.email ?? "Sin correo visible"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
                  Rol del sistema: {roleLabel(member.workspace_role)}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs ${getCommercialProfileSummary(member).tone}`}>
                  {getCommercialProfileSummary(member).label}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Acceso al sistema</p>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  Este dato controla lo que la persona puede hacer dentro del admin de la inmobiliaria.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Perfil comercial</p>
                {member.agent_profile ? (
                  <div className="mt-2 text-sm leading-6 text-stone-700">
                    <p className="font-medium text-stone-900">{member.agent_profile.display_name}</p>
                    <p>{member.agent_profile.title ?? "Sin especialidad cargada"}</p>
                    <p className="text-xs text-stone-500">Slug: {member.agent_profile.slug}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Esta persona participa internamente, pero todavía no tiene un perfil comercial vinculado.
                  </p>
                )}
              </div>
            </div>

            <AgentProfileEditor member={member} workspaceId={workspaceId} />
          </div>
        ))}
        </div>
      </div>

      <StandaloneAgentsList agents={standaloneAgents} workspaceId={workspaceId} />
    </div>
  );
}
