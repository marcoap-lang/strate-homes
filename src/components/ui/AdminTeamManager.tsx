"use client";

import { useActionState, useState } from "react";
import { upsertAgentProfileAction, type AgentProfileState } from "@/app/admin/actions";
import type { TeamMemberRecord } from "@/lib/admin-types";

const initialState: AgentProfileState = { success: false, message: "" };

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "staff") return "Staff";
  if (role === "agent") return "Agent (legacy)";
  return role;
}

function AgentProfileEditor({ member }: { member: TeamMemberRecord }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(upsertAgentProfileAction, initialState);
  const profile = member.agent_profile;

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Perfil comercial de agente</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Activa o edita el perfil comercial sin tocar el rol operativo del workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100"
        >
          {open ? "Cerrar" : profile ? "Editar perfil comercial" : "Activar perfil comercial"}
        </button>
      </div>

      {open ? (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="profileId" value={member.profile_id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Nombre público</span>
              <input
                name="displayName"
                defaultValue={profile?.display_name ?? member.full_name ?? ""}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Slug</span>
              <input
                name="slug"
                defaultValue={profile?.slug ?? member.full_name ?? member.email ?? ""}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Especialidad</span>
              <input
                name="title"
                defaultValue={profile?.title ?? ""}
                placeholder="Ej. Residencial premium en zona norte"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Zonas</span>
              <input
                name="zones"
                defaultValue={profile?.title ?? ""}
                placeholder="Ej. San Pedro, Valle, Cumbres"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Correo comercial</span>
              <input
                name="email"
                defaultValue={profile?.email ?? member.email ?? ""}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Teléfono</span>
              <input
                name="phone"
                defaultValue={profile?.phone ?? member.phone ?? ""}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">WhatsApp</span>
              <input
                name="whatsapp"
                defaultValue={profile?.whatsapp ?? ""}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>

            <label className="space-y-2 text-sm text-stone-700">
              <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Foto</span>
              <input
                name="avatarUrl"
                defaultValue={profile?.avatar_url ?? member.avatar_url ?? ""}
                placeholder="https://..."
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-stone-700">
            <span className="block text-xs uppercase tracking-[0.2em] text-stone-500">Bio</span>
            <textarea
              name="bio"
              rows={4}
              defaultValue={profile?.bio ?? ""}
              placeholder="Presentación comercial breve del asesor"
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-400"
            />
          </label>

          <label className="inline-flex items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" name="isPublic" defaultChecked={profile?.is_public ?? true} className="size-4 rounded border-stone-300 bg-white" />
            Mostrar como perfil comercial público
          </label>

          {state.message ? (
            <p className={`rounded-2xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {state.message}
            </p>
          ) : null}

          <button disabled={pending} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
            {pending ? "Guardando..." : profile ? "Guardar perfil comercial" : "Activar perfil comercial"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function AdminTeamManager({ teamMembers }: { teamMembers: TeamMemberRecord[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/40">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Equipo</p>
        <h3 className="mt-2 text-2xl font-semibold text-stone-950">Equipo del workspace</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
          Aquí se separa claramente el <span className="font-medium text-stone-900">rol operativo</span> del sistema y el
          <span className="font-medium text-stone-900"> perfil comercial de agente</span>. Una misma persona puede tener permisos amplios dentro del workspace y además aparecer como asesor comercial.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Miembros activos</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Con perfil comercial</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.filter((member) => member.agent_profile).length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/30">
          <p className="text-sm text-stone-500">Solo operación interna</p>
          <p className="mt-3 text-2xl font-semibold text-stone-950">{teamMembers.filter((member) => !member.agent_profile).length}</p>
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
                  Rol operativo: {roleLabel(member.workspace_role)}
                </span>
                {member.agent_profile ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                    Perfil comercial activo
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                    Sin perfil comercial
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Permiso interno</p>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  Este dato vive en la membresía del workspace y controla lo que la persona puede hacer dentro del sistema.
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
                    Esta persona participa operativamente en el workspace, pero no tiene un perfil comercial de agente activo.
                  </p>
                )}
              </div>
            </div>

            <AgentProfileEditor member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}
