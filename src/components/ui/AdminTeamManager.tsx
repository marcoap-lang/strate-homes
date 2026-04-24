"use client";

import type { TeamMemberRecord } from "@/lib/admin-types";

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  if (role === "staff") return "Staff";
  if (role === "agent") return "Agent (legacy)";
  return role;
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
                    <p>{member.agent_profile.title ?? "Sin título comercial"}</p>
                    <p className="text-xs text-stone-500">Slug: {member.agent_profile.slug}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Esta persona participa operativamente en el workspace, pero no tiene un perfil comercial de agente activo.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
