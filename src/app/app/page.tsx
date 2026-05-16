import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminPublicBrandingManager } from "@/components/ui/AdminPublicBrandingManager";
import { AdminShell } from "@/components/ui/AdminShell";
import { getAdminAccessState, type AdminAccessState } from "@/lib/admin-access";
import { commercialPlans, getPlanLabel, type CommercialPlanKey } from "@/lib/commercial";

type ReadyAccess = Extract<AdminAccessState, { kind: "ready" }>;
type DashboardProperty = ReadyAccess["properties"][number];
type DashboardLead = ReadyAccess["leads"][number];

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function getPropertyPublicationScore(property: DashboardProperty) {
  const images = property.property_images ?? [];
  const assignedAgent = property.agent_id ? property.agents : null;
  const primaryAgent = Array.isArray(assignedAgent) ? assignedAgent[0] : assignedAgent;
  const collaboratorAgents = property.property_agent_assignments ?? [];
  const hasWhatsapp = Boolean(primaryAgent?.whatsapp || primaryAgent?.phone) || collaboratorAgents.some((assignment) => {
    const agent = Array.isArray(assignment.agents) ? assignment.agents[0] : assignment.agents;
    return Boolean(agent?.whatsapp || agent?.phone);
  });

  const checks = [
    { label: "portada", done: images.some((image) => image.is_cover) },
    { label: "5+ fotos", done: images.length >= 5 },
    { label: "descripción", done: Boolean(property.description?.trim()) },
    { label: "precio", done: Boolean(property.price_amount) },
    { label: "ubicación", done: Boolean(property.location_label?.trim()) },
    { label: "responsable", done: Boolean(primaryAgent) },
    { label: "WhatsApp", done: hasWhatsapp },
    { label: "activa", done: property.status === "active" },
  ];

  const score = (checks.filter((check) => check.done).length / checks.length) * 100;
  return {
    score,
    missing: checks.filter((check) => !check.done).map((check) => check.label),
  };
}

function getLeadAlertCount(leads: DashboardLead[]) {
  return leads.filter((lead) => {
    if (["closed", "lost"].includes(lead.status)) return false;
    const ageHours = (Date.now() - new Date(lead.created_at).getTime()) / 36e5;
    if (lead.status === "new" && ageHours >= 2) return true;
    if (!lead.next_follow_up_at) return true;
    const lastTouch = lead.last_contacted_at ?? lead.created_at;
    return (Date.now() - new Date(lastTouch).getTime()) / 36e5 >= 48;
  }).length;
}

export default async function AppPage() {
  const access = await getAdminAccessState();

  if (access.kind === "no-session") {
    redirect("/login?next=/app");
  }

  return (
    <AdminShell>
      {access.kind === "ready" ? (
        (() => {
          const onboardingItems = [
            { label: "Configurar inmobiliaria", done: Boolean(access.activeWorkspace.brandName && access.activeWorkspace.publicClaim), href: "/app/public" },
            { label: "Subir logo", done: Boolean(access.activeWorkspace.publicLogoUrl), href: "/app/public" },
            { label: "Crear primer asesor", done: access.agents.length > 0, href: "/app/team" },
            { label: "Crear primera propiedad", done: access.properties.length > 0, href: "/app/properties/new" },
            { label: "Subir fotos", done: access.properties.some((property) => property.property_images.length > 0), href: "/app/properties" },
            { label: "Publicar sitio", done: access.properties.some((property) => property.status === "active"), href: "/app/public/properties" },
          ];
          const onboardingProgress = (onboardingItems.filter((item) => item.done).length / onboardingItems.length) * 100;
          const showInitialSetup = onboardingProgress < 100;
          const currentPlanKey = access.subscription?.plan === "small_agency" || access.subscription?.plan === "agency" ? access.subscription.plan : "solo";
          const currentPlan = commercialPlans[currentPlanKey as CommercialPlanKey];
          const publicationScores = access.properties.map(getPropertyPublicationScore);
          const averagePublicationScore = publicationScores.length
            ? publicationScores.reduce((total, item) => total + item.score, 0) / publicationScores.length
            : 0;
          const incompleteProperties = access.properties.filter((property) => getPropertyPublicationScore(property).score < 85);
          const leadAlerts = getLeadAlertCount(access.leads);
          const agentAlerts = access.agents.filter((agent) => agent.is_public && !agent.whatsapp && !agent.phone).length;
          const activePropertiesWithoutAgent = access.properties.filter((property) => property.status === "active" && !property.agent_id).length;

          return (
            <div className="space-y-8">
              <section className={`grid gap-4 ${showInitialSetup ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
                <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-[linear-gradient(135deg,#07101f_0%,#172233_52%,#2c241b_100%)] p-6 text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)]">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">Hoy en la inmobiliaria</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Prioridades para vender con mejor seguimiento.</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                    Revisa lo que mueve la operación diaria: publicar buenas fichas, atender interesados, asignar responsables y mantener el sitio público listo para compradores.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link href="/app/properties/new" className="rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#c99a46]">
                      Agregar propiedad
                    </Link>
                    <Link href="/app/leads" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15">
                      Revisar interesados
                    </Link>
                  </div>
                </article>

                {showInitialSetup ? (
                  <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Arranque inicial</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-slate-950">Preparación de cuenta</h3>
                      <p className="text-3xl font-semibold text-slate-950">{formatPercent(onboardingProgress)}</p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#d7ab5b]" style={{ width: formatPercent(onboardingProgress) }} />
                    </div>
                    <div className="mt-5 space-y-2">
                      {onboardingItems.map((item) => (
                        <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm transition hover:bg-white">
                          <span className="font-medium text-slate-800">{item.label}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs ${item.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {item.done ? "Listo" : "Pendiente"}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link href="/app/onboarding" className="mt-4 inline-flex w-full justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Ver pasos pendientes
                    </Link>
                  </article>
                ) : null}
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Inventario activo", value: access.properties.filter((property) => property.status === "active").length, detail: `${access.properties.length} propiedades registradas` },
                  { label: "Calidad de fichas", value: formatPercent(averagePublicationScore), detail: `${incompleteProperties.length} fichas por pulir` },
                  { label: "Interesados pendientes", value: leadAlerts, detail: "Sin respuesta, seguimiento o movimiento" },
                  { label: "Interés recibido", value: access.conversionSummary.events7d, detail: `${access.conversionSummary.whatsappClicks7d} WhatsApp · ${access.conversionSummary.leadForms7d} formularios` },
                ].map((item) => (
                  <article key={item.label} className="rounded-[1.65rem] border border-[color:var(--admin-line)] bg-white p-5 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                    <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Capacidad contratada</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{getPlanLabel(access.subscription?.plan)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{currentPlan.description}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Propiedades activas", `${access.properties.filter((property) => property.status === "active").length}/${currentPlan.limits.activeProperties}`],
                      ["Asesores", `${access.agents.length}/${currentPlan.limits.agents}`],
                      ["Usuarios internos", `${access.teamMembers.length}/${currentPlan.limits.internalUsers}`],
                      ["Tours", `${access.tours.length}/${currentPlan.limits.tours}`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-[#fff8ec] p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#9b6f21]">Acciones recomendadas</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Qué hacer para vender mejor esta semana</h3>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {[
                      { label: incompleteProperties.length ? "Completar fichas incompletas" : "Mantener inventario actualizado", href: "/app/properties" },
                      { label: leadAlerts ? "Responder interesados pendientes" : "Revisar clientes interesados", href: "/app/leads" },
                      { label: agentAlerts + activePropertiesWithoutAgent ? "Corregir responsables y WhatsApp" : "Compartir perfiles de asesores", href: "/app/team" },
                      { label: "Ver sitio público como cliente", href: access.activeWorkspace.workspaceSlug ? `/w/${access.activeWorkspace.workspaceSlug}` : "/properties" },
                    ].map((action) => (
                      <Link key={action.label} href={action.href} className="rounded-2xl border border-amber-100 bg-white px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-[#d7ab5b]">
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Prioridad comercial</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">Fichas que necesitan cierre</h3>
                    </div>
                    <Link href="/app/properties" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Ver inventario
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(incompleteProperties.length ? incompleteProperties : access.properties.slice(0, 3)).slice(0, 4).map((property) => {
                      const publication = getPropertyPublicationScore(property);
                      return (
                        <Link key={property.id} href={`/app/properties/${property.id}`} className="block rounded-[1.35rem] border border-slate-100 bg-slate-50 px-4 py-4 transition hover:bg-white">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-950">{property.title}</p>
                              <p className="mt-1 text-sm text-slate-500">{property.location_label ?? "Ubicación pendiente"} · {property.status}</p>
                            </div>
                            <p className="text-lg font-semibold text-slate-950">{formatPercent(publication.score)}</p>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-[#d7ab5b]" style={{ width: formatPercent(publication.score) }} />
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {publication.missing.length ? `Falta: ${publication.missing.slice(0, 4).join(", ")}` : "Lista para compartirse con confianza."}
                          </p>
                        </Link>
                      );
                    })}
                    {!access.properties.length ? (
                      <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                        Todavía no hay propiedades. Crear la primera abre el flujo de fotos, publicación y sitio público.
                      </div>
                    ) : null}
                  </div>
                </article>

                <article className="rounded-[1.9rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Inmobiliaria pública</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Marca, contacto y presencia</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Esto alimenta la página pública de la inmobiliaria y ayuda a que cada propiedad se vea confiable desde el primer contacto.
                  </p>
                  <div className="mt-5">
                    <AdminPublicBrandingManager workspace={access.activeWorkspace} />
                  </div>
                </article>
              </section>
            </div>
          );
        })()
      ) : (
        <AdminAccessClient />
      )}
    </AdminShell>
  );
}
