import { AdminShell } from "@/components/ui/AdminShell";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { getAdminAccessState } from "@/lib/admin-access";

export default async function AdminLeadsPage() {
  const access = await getAdminAccessState();

  return (
    <AdminShell>
      {access.kind === "no-session" ? (
        <AdminAccessClient />
      ) : access.kind === "ready" ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Leads</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Interesados recibidos</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Aquí ves los contactos que llegaron desde las propiedades públicas y la propiedad que despertó su interés.</p>
          </div>

          <div className="grid gap-4">
            {access.leads.length ? access.leads.map((lead) => (
              <div key={`${lead.id}-${lead.created_at}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{lead.full_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">{lead.status}</span>
                </div>
                <p className="mt-4 text-sm text-slate-700"><span className="font-medium text-slate-900">Propiedad:</span> {lead.property_title ?? "Sin referencia"}</p>
                {lead.message ? <p className="mt-3 text-sm leading-7 text-slate-600">{lead.message}</p> : null}
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Todavía no hay leads recibidos.</div>
            )}
          </div>
        </div>
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
