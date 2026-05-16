import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPublicBrandingManager } from "@/components/ui/AdminPublicBrandingManager";
import { AdminShell } from "@/components/ui/AdminShell";
import { getAdminAccessState } from "@/lib/admin-access";

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AdminPage() {
  const access = await getAdminAccessState();

  if (access.kind === "no-session") {
    redirect("/login");
  }

  return (
    <AdminShell>
      {access.kind === "ready" ? (
        (() => {
          const propertiesReadyToPublish = access.properties.filter(
            (property) =>
              property.status !== "active"
              && Boolean(property.price_amount)
              && Boolean(property.location_label)
              && Boolean(property.property_images.length)
              && Boolean(property.description?.trim()),
          );
          const leadsWithoutFollowUp = access.leads.filter((lead) => lead.status === "new");
          const incompleteProperties = access.properties.filter(
            (property) =>
              !property.price_amount
              || !property.location_label
              || !property.agent_id
              || !property.property_images.length
              || !(property.description?.trim()),
          );
          const publicSitePendingTasks = [
            !access.activeWorkspace.brandName ? "Agregar nombre comercial" : null,
            !access.activeWorkspace.publicLogoUrl ? "Subir logo principal" : null,
            !access.activeWorkspace.publicClaim ? "Definir claim público" : null,
            !access.activeWorkspace.publicPhone && !access.activeWorkspace.publicWhatsapp ? "Agregar canal de contacto" : null,
          ].filter(Boolean);
          const publishedProperties = access.properties.filter((property) => property.status === "active").length;
          const publicationReadiness = access.properties.length
            ? (publishedProperties / access.properties.length) * 100
            : 0;

          return (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Propiedades listas para publicar",
                    value: propertiesReadyToPublish.length,
                    tone: "bg-[#fff8ea] border-[#ead6ad] text-[#8e6b2d]",
                  },
                  {
                    label: "Leads sin seguimiento",
                    value: leadsWithoutFollowUp.length,
                    tone: "bg-[#f8fbff] border-sky-200 text-sky-800",
                  },
                  {
                    label: "Fichas incompletas",
                    value: incompleteProperties.length,
                    tone: "bg-white border-slate-200 text-slate-800",
                  },
                  {
                    label: "Sitio público pendiente",
                    value: publicSitePendingTasks.length,
                    tone: "bg-[#f6f8fb] border-slate-200 text-slate-700",
                  },
                ].map((item) => (
                  <article key={item.label} className={`rounded-[1.65rem] border p-5 shadow-sm ${item.tone}`}>
                    <p className="text-xs uppercase tracking-[0.22em]">{item.label}</p>
                    <p className="mt-4 text-4xl font-semibold tracking-tight">{item.value}</p>
                  </article>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Prioridades</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Pendientes para publicar</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Lo que ya va encaminado y necesita cierre operativo para salir al sitio.</p>
                    </div>
                    <Link href="/admin/properties" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Ver inventario
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(propertiesReadyToPublish.length ? propertiesReadyToPublish : access.properties.slice(0, 3)).map((property) => {
                      const primaryAgent = firstJoined(property.agents);
                      const completionChecks = [
                        Boolean(property.price_amount),
                        Boolean(property.location_label),
                        Boolean(property.agent_id),
                        Boolean(property.property_images.length),
                        Boolean(property.description?.trim()),
                      ];
                      const completion = (completionChecks.filter(Boolean).length / completionChecks.length) * 100;

                      return (
                        <article key={property.id} className="rounded-[1.45rem] border border-slate-200 bg-slate-50/70 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-lg font-semibold text-slate-950">{property.title}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {property.location_label ?? "Ubicación pendiente"} · {primaryAgent?.display_name ?? "Sin asesor principal"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                {property.status}
                              </span>
                              <Link href={`/admin/properties/${property.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                                Abrir ficha
                              </Link>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="h-2 overflow-hidden rounded-full bg-white">
                              <div className="h-full rounded-full bg-[#d7ab5b]" style={{ width: formatPercent(completion) }} />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Completitud estimada: {formatPercent(completion)}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-5">
                  <article className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Acciones rápidas</p>
                    <div className="mt-4 grid gap-3">
                      <Link href="/admin/properties/new" className="rounded-[1.2rem] bg-slate-950 px-4 py-4 text-sm font-medium text-white transition hover:bg-slate-800">
                        Agregar propiedad
                      </Link>
                      <Link href="/admin/leads" className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        Responder leads
                      </Link>
                      <Link href="/admin/public" className="rounded-[1.2rem] border border-[#ead6ad] bg-[#fff8ea] px-4 py-4 text-sm font-medium text-[#8e6b2d] transition hover:bg-[#fff4dc]">
                        Ver sitio público
                      </Link>
                    </div>
                  </article>

                  <article className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Actividad del sitio</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Marca y presencia pública</h3>
                    <div className="mt-4 space-y-3">
                      {publicSitePendingTasks.length ? publicSitePendingTasks.map((task) => (
                        <div key={task} className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
                          {task}
                        </div>
                      )) : (
                        <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          La base pública principal ya está configurada.
                        </div>
                      )}
                    </div>
                    <div className="mt-5 rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-900">Publicación activa</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatPercent(publicationReadiness)}</p>
                      <p className="mt-2 text-sm text-slate-500">{publishedProperties} de {access.properties.length} propiedades activas.</p>
                    </div>
                  </article>
                </section>
              </div>

              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Clientes</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">Leads nuevos</h3>
                    </div>
                    <Link href="/admin/leads" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Ver todos
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {access.leads.slice(0, 4).map((lead) => (
                      <article key={lead.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">{lead.full_name}</p>
                            <p className="mt-1 text-sm text-slate-500">{lead.phone}{lead.property_title ? ` · ${lead.property_title}` : ""}</p>
                          </div>
                          <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                            {lead.status}
                          </span>
                        </div>
                      </article>
                    ))}
                    {!access.leads.length ? (
                      <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                        Todavía no hay leads recibidos.
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sitio</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Configuración pública principal</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Ajusta la marca visible, el claim, los datos de contacto y la portada principal de la inmobiliaria. Esto alimenta la presencia pública del sistema.
                  </p>
                  <div className="mt-5">
                    <AdminPublicBrandingManager workspace={access.activeWorkspace} />
                  </div>
                </section>
              </div>
            </div>
          );
        })()
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
