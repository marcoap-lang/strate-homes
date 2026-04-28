import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getAdminAccessState } from "@/lib/admin-access";
import { buildPublicAgentUrl } from "@/lib/public-links";

export default async function AdminPublicAgentsPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Área Pública</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Asesores públicos</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Aquí ves qué asesores están visibles en el sitio público y cómo abrir su página directamente.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...access.teamMembers.filter((member) => member.agent_profile).map((member) => member.agent_profile!), ...access.standaloneAgents].map((agent) => (
              <div key={agent.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
                <p className="text-lg font-semibold text-slate-950">{agent.display_name}</p>
                <p className="mt-2 text-sm text-slate-600">{agent.title ?? "Asesor inmobiliario"}</p>
                <div className="mt-4 flex items-center gap-3 text-sm">
                  <span className={`rounded-full px-3 py-1 text-xs ${agent.is_public ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {agent.is_public ? "Visible públicamente" : "No visible"}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={buildPublicAgentUrl(agent.slug, access.activeWorkspace.workspaceSlug ?? null)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Ver página pública
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
