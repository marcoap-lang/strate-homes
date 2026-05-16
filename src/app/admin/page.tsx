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

function getStatusBadge(status: string) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "draft") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

const primaryButtonClass = "inline-flex items-center justify-between gap-3 rounded-[1.2rem] bg-[linear-gradient(135deg,var(--admin-ink)_0%,var(--admin-ink-soft)_100%)] px-5 py-4 text-sm font-medium text-white shadow-[0_18px_35px_rgba(20,33,61,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(20,33,61,0.22)]";
const secondaryButtonClass = "inline-flex items-center justify-between gap-3 rounded-[1.2rem] border border-[color:var(--admin-line)] bg-white px-5 py-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-[color:var(--admin-cloud)]";
const warmButtonClass = "inline-flex items-center justify-between gap-3 rounded-[1.2rem] border border-[color:var(--admin-sand)]/35 bg-[linear-gradient(180deg,#fff8eb_0%,#fdf1dd_100%)] px-5 py-4 text-sm font-medium text-[color:var(--admin-ink)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(208,163,91,0.16)]";

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
                  <article key={item.label} className={`rounded-[1.65rem] border p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)] ${item.tone}`}>
                    <p className="text-xs uppercase tracking-[0.22em]">{item.label}</p>
                    <p className="mt-4 text-4xl font-semibold tracking-tight">{item.value}</p>
                  </article>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)] sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Prioridades</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Pendientes para publicar</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Lo que ya va encaminado y necesita cierre operativo para salir al sitio.</p>
                    </div>
                    <Link href="/app/properties" className="rounded-full border border-[color:var(--admin-line)] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[color:var(--admin-cloud)]">
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
                        <article key={property.id} className="rounded-[1.45rem] border border-[color:var(--admin-line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_8px_24px_rgba(20,33,61,0.04)]">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-lg font-semibold text-slate-950">{property.title}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {property.location_label ?? "Ubicación pendiente"} · {primaryAgent?.display_name ?? "Sin responsable comercial"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(property.status)}`}>
                                {property.status}
                              </span>
                              <Link href={`/app/properties/${property.id}`} className="rounded-full bg-[color:var(--admin-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--admin-ink-soft)]">
                                Editar
                              </Link>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--admin-sand)_0%,#e4bc78_100%)]" style={{ width: formatPercent(completion) }} />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Completitud estimada: {formatPercent(completion)}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-5">
                  <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)] sm:p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Acciones rápidas</p>
                    <div className="mt-4 grid gap-3">
                      <Link href="/app/properties/new" className={primaryButtonClass}>
                        <span>
                          <span className="block text-base font-semibold">Agregar propiedad</span>
                          <span className="mt-1 block text-xs text-white/70">Dar de alta una nueva ficha sin salir del flujo.</span>
                        </span>
                        <span className="text-lg leading-none text-white/80">+</span>
                      </Link>
                      <Link href="/app/leads" className={secondaryButtonClass}>
                        <span>
                          <span className="block text-base font-semibold text-slate-900">Responder leads</span>
                          <span className="mt-1 block text-xs text-slate-500">Entrar al seguimiento comercial y contestar primero.</span>
                        </span>
                        <span className="text-sm text-slate-400">→</span>
                      </Link>
                      <Link href="/app/public" className={warmButtonClass}>
                        <span>
                          <span className="block text-base font-semibold">Ajustar inmobiliaria</span>
                          <span className="mt-1 block text-xs text-slate-500">Pulir marca, visibilidad y presencia digital.</span>
                        </span>
                        <span className="text-sm text-[#8e6b2d]">↗</span>
                      </Link>
                    </div>
                  </article>

                  <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)] sm:p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Actividad del sitio</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Marca y presencia pública</h3>
                    <div className="mt-4 space-y-3">
                      {publicSitePendingTasks.length ? publicSitePendingTasks.map((task) => (
                        <div key={task} className="rounded-[1.2rem] border border-[color:var(--admin-line)] bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
                          {task}
                        </div>
                      )) : (
                        <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          La base pública de la inmobiliaria ya está configurada.
                        </div>
                      )}
                    </div>
                    <div className="mt-5 rounded-[1.3rem] border border-[color:var(--admin-line)] bg-[color:var(--admin-cloud)] p-4">
                      <p className="text-sm font-medium text-slate-900">Publicación activa</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatPercent(publicationReadiness)}</p>
                      <p className="mt-2 text-sm text-slate-500">{publishedProperties} de {access.properties.length} propiedades activas.</p>
                    </div>
                  </article>
                </section>
              </div>

              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)] sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Clientes</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">Leads nuevos</h3>
                    </div>
                    <Link href="/app/leads" className="rounded-full border border-[color:var(--admin-line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[color:var(--admin-cloud)]">
                      Ver todos
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {access.leads.slice(0, 4).map((lead) => (
                      <article key={lead.id} className="rounded-[1.35rem] border border-[color:var(--admin-line)] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">{lead.full_name}</p>
                            <p className="mt-1 text-sm text-slate-500">{lead.phone}{lead.property_title ? ` · ${lead.property_title}` : ""}</p>
                          </div>
                          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${lead.status === "new" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}>
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

                <section className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)] sm:p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sitio</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Inmobiliaria y sitio público</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Ajusta la marca visible, el claim, los datos de contacto y la portada principal del negocio. Esto alimenta tanto la página de la inmobiliaria como la experiencia pública del sitio.
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
