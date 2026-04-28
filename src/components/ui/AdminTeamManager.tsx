"use client";

import { useActionState, useState } from "react";
import { createAgentAction, upsertAgentProfileAction, type AgentProfileState, type CreateAgentState } from "@/app/admin/actions";
import type { StandaloneAgentRecord, TeamMemberRecord } from "@/lib/admin-types";

const initialProfileState: AgentProfileState = { success: false, message: "" };
const initialCreateState: CreateAgentState = { success: false, message: "" };

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "staff") return "Staff";
  if (role === "agent") return "Agent (legacy)";
  return role;
}

function NewAgentForm() {
  const [open, setOpen] = useState(false);
  const [accessType, setAccessType] = useState<"public-only" | "with-access">("public-only");
  const [state, action, pending] = useActionState(createAgentAction, initialCreateState);

  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Asesores</p>
          <h3 className="mt-2 text-2xl font-semibold text-stone-950">Equipo comercial</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
            Crea asesores para asignar propiedades y mostrarlos en el sitio público, con o sin acceso al sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46]"
        >
          {open ? "Cerrar" : "Nuevo asesor"}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Tipo de acceso</span>
              <select
                name="accessType"
                value={accessType}
                onChange={(event) => setAccessType(event.target.value === "with-access" ? "with-access" : "public-only")}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950"
              >
                <option value="public-only">Solo perfil público</option>
                <option value="with-access">Invitar con acceso</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre público</span>
              <input name="displayName" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug</span>
              <input name="slug" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Especialidad</span>
              <input name="title" placeholder="Ej. Residencial premium en zona norte" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700 md:col-span-2">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Bio corta</span>
              <textarea name="bio" rows={3} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo</span>
              <input name="email" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Teléfono</span>
              <input name="phone" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">WhatsApp</span>
              <input name="whatsapp" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Foto</span>
              <input name="avatarUrl" placeholder="https://..." className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" name="isPublic" defaultChecked className="size-4 rounded border-stone-300 bg-white" />
            Mostrar asesor públicamente
          </label>

          {state.message ? (
            <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {state.message}
            </p>
          ) : null}

          <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {pending ? "Guardando..." : accessType === "with-access" ? "Crear asesor con acceso básico" : "Crear asesor"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function AgentProfileEditor({ member }: { member: TeamMemberRecord }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(upsertAgentProfileAction, initialProfileState);
  const profile = member.agent_profile;

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Perfil del asesor</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Edita la presencia comercial del asesor sin tocar sus permisos internos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100"
        >
          {open ? "Cerrar" : profile ? "Editar asesor" : "Activar asesor"}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="profileId" value={member.profile_id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre público</span>
              <input name="displayName" defaultValue={profile?.display_name ?? member.full_name ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug</span>
              <input name="slug" defaultValue={profile?.slug ?? member.full_name ?? member.email ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Especialidad</span>
              <input name="title" defaultValue={profile?.title ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo comercial</span>
              <input name="email" defaultValue={profile?.email ?? member.email ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Teléfono</span>
              <input name="phone" defaultValue={profile?.phone ?? member.phone ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">WhatsApp</span>
              <input name="whatsapp" defaultValue={profile?.whatsapp ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Foto</span>
              <input name="avatarUrl" defaultValue={profile?.avatar_url ?? member.avatar_url ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
            </label>
          </div>

          <label className="space-y-2 text-sm text-stone-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Bio</span>
            <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ""} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400" />
          </label>

          <label className="inline-flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" name="isPublic" defaultChecked={profile?.is_public ?? true} className="size-4 rounded border-stone-300 bg-white" />
            Mostrar asesor públicamente
          </label>

          {state.message ? (
            <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {state.message}
            </p>
          ) : null}

          <button disabled={pending} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c99a46] disabled:opacity-60">
            {pending ? "Guardando..." : profile ? "Guardar asesor" : "Activar asesor"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function StandaloneAgentsList({ agents }: { agents: StandaloneAgentRecord[] }) {
  if (!agents.length) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Asesores sin acceso</p>
        <h3 className="mt-2 text-2xl font-semibold text-stone-950">Perfiles comerciales independientes</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
          Estos asesores pueden recibir propiedades y aparecer en el sitio público sin entrar al sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.id} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
            <p className="text-lg font-semibold text-stone-950">{agent.display_name}</p>
            <p className="mt-2 text-sm text-stone-600">{agent.title ?? "Asesor inmobiliario"}</p>
            {agent.email ? <p className="mt-3 text-sm text-stone-500">{agent.email}</p> : null}
            {agent.whatsapp ?? agent.phone ? <p className="mt-1 text-sm text-stone-500">{agent.whatsapp ?? agent.phone}</p> : null}
            <p className="mt-3 text-xs text-stone-500">Slug: {agent.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTeamManager({ teamMembers, standaloneAgents }: { teamMembers: TeamMemberRecord[]; standaloneAgents: StandaloneAgentRecord[] }) {
  return (
    <div className="space-y-6">
      <NewAgentForm />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Miembros activos</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Con asesor activo</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.filter((member) => member.agent_profile).length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Solo operación interna</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.filter((member) => !member.agent_profile).length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Asesores sin acceso</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{standaloneAgents.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.membership_id} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-stone-950">{member.full_name ?? member.email ?? member.profile_id}</p>
                <p className="mt-1 text-sm text-stone-500">{member.email ?? "Sin correo visible"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
                  Permiso interno: {roleLabel(member.workspace_role)}
                </span>
                {member.agent_profile ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                    Asesor activo
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                    Sin asesor activo
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Operación interna</p>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  Este dato controla lo que la persona puede hacer dentro del sistema.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Asesor comercial</p>
                {member.agent_profile ? (
                  <div className="mt-2 text-sm leading-6 text-stone-700">
                    <p className="font-medium text-stone-900">{member.agent_profile.display_name}</p>
                    <p>{member.agent_profile.title ?? "Sin especialidad cargada"}</p>
                    <p className="text-xs text-stone-500">Slug: {member.agent_profile.slug}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Esta persona participa internamente, pero todavía no tiene asesor comercial activo.
                  </p>
                )}
              </div>
            </div>

            <AgentProfileEditor member={member} />
          </div>
        ))}
      </div>

      <StandaloneAgentsList agents={standaloneAgents} />
    </div>
  );
}
