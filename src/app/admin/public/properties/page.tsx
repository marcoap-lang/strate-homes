import Link from "next/link";
import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getAdminAccessState } from "@/lib/admin-access";
import { buildPublicPropertyUrl } from "@/lib/public-links";

function getPrimaryAgentName(property: { agents?: { display_name: string } | Array<{ display_name: string }> | null }) {
  if (Array.isArray(property.agents)) return property.agents[0]?.display_name ?? null;
  return property.agents?.display_name ?? null;
}

function getCollaboratorNames(property: { property_agent_assignments?: Array<{ agents?: { display_name: string } | Array<{ display_name: string }> | null }> | null }) {
  return (property.property_agent_assignments ?? [])
    .map((assignment) => Array.isArray(assignment.agents) ? assignment.agents[0]?.display_name : assignment.agents?.display_name)
    .filter(Boolean);
}

export default async function AdminPublicPropertiesPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Área Pública</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Propiedades públicas</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Controla qué propiedades salen al sitio y confirma que cada una tenga un asesor principal claro. El WhatsApp de la ficha pública debe apuntar a ese asesor.</p>
          </div>

          <div className="grid gap-4">
            {access.properties.map((property) => (
              <div key={property.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{property.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{property.location_label}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${property.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {property.status === "active" ? "Visible en el sitio público" : "No visible para clientes"}
                  </span>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Asesor principal:</span> {getPrimaryAgentName(property) ?? "Sin asignar"}
                  <span className="mx-2 text-slate-300">•</span>
                  Colaboradores: {getCollaboratorNames(property).join(", ") || "sin colaboradores"}.
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={buildPublicPropertyUrl(property.slug, access.activeWorkspace.workspaceSlug ?? null)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Ver pública
                  </a>
                  <Link href={`/admin/properties/${property.id}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Editar propiedad
                  </Link>
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
