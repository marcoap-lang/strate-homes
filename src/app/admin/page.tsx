import Link from "next/link";
import { redirect } from "next/navigation";
import { AdCampaignStatusForm, AnnouncementForm, AnnouncementToggleForm } from "@/components/ui/PlatformAdminForms";
import { getPlanLabel } from "@/lib/commercial";
import { buildWorkspacePropertyPath, getPublicBaseUrl } from "@/lib/public-links";
import { getPlatformAdminState, type PlatformActivityEvent } from "@/lib/platform-admin";

function formatEventLabel(value: string) {
  const labels: Record<string, string> = {
    lead_received: "Lead recibido",
    lead_updated: "Lead actualizado",
    property_created: "Propiedad creada",
    property_updated: "Propiedad actualizada",
    property_published: "Propiedad publicada",
    property_status_updated: "Estatus actualizado",
    agent_created: "Asesor creado",
    agent_updated: "Asesor actualizado",
    branding_updated: "Marca actualizada",
    subscription_updated: "Suscripción actualizada",
    workspace_note_created: "Nota interna",
    workspace_followup_created: "Seguimiento creado",
    workspace_followup_completed: "Seguimiento completado",
    workspace_status_updated: "Estatus de cuenta",
    workspace_owner_changed: "Owner actualizado",
    feature_flag_updated: "Feature flag",
    announcement_created: "Anuncio creado",
    ad_campaign_requested: "Publicidad solicitada",
    ad_campaign_status_updated: "Publicidad actualizada",
    workspace_deleted: "Organización eliminada",
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

function healthClass(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 55) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function commercialStatusLabel(value: string) {
  const labels: Record<string, string> = {
    prospect: "Prospectos",
    demo: "Demos",
    customer: "Clientes",
    risk: "En riesgo",
    churn: "Churn",
  };
  return labels[value] ?? value;
}

function buildCampaignUrl(request: { id: string; channels: string[]; workspace_slug: string | null; property_slug: string | null }) {
  const path = request.property_slug && request.workspace_slug ? buildWorkspacePropertyPath(request.workspace_slug, request.property_slug) : request.workspace_slug ? `/w/${request.workspace_slug}` : "/";
  const url = new URL(`${getPublicBaseUrl()}${path}`);
  const source = request.channels.includes("google") ? "google" : request.channels.includes("facebook") ? "facebook" : request.channels.includes("instagram") ? "instagram" : "paid";
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", source === "google" ? "paid_search" : "paid_social");
  url.searchParams.set("utm_campaign", `strate_${request.id.slice(0, 8)}`);
  url.searchParams.set("ad_campaign", request.id);
  return url.toString();
}

function Forbidden({ email }: { email: string | null }) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Strate Homes Admin</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Acceso interno restringido</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">Este `/admin` queda reservado para operación interna de Strate.</p>
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/70">
          Usuario actual: {email ?? "sin email visible"}.
        </p>
        <Link href="/app" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90">
          Ir a la app del cliente
        </Link>
      </section>
    </main>
  );
}

function ActivityList({ activity }: { activity: PlatformActivityEvent[] }) {
  return (
    <div className="space-y-3">
      {activity.map((event) => (
        <Link key={event.id} href={event.workspace_id ? `/admin/workspaces/${event.workspace_id}` : "/admin/activity"} className="block rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 transition hover:bg-white/[0.08]">
          <p className="text-sm font-semibold text-white">{formatEventLabel(event.event_type)}</p>
          <p className="mt-1 text-xs text-white/45">{event.workspace_name ?? "Sistema"} · {new Date(event.created_at).toLocaleString("es-MX")}</p>
        </Link>
      ))}
      {!activity.length ? <p className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm text-white/50">Aún no hay actividad registrada.</p> : null}
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; health?: string; alert?: string }>;
}) {
  const params = await searchParams;
  const state = await getPlatformAdminState(params ?? {});

  if (state.kind === "no-session") redirect("/login?next=/admin");
  if (state.kind === "forbidden") return <Forbidden email={state.email} />;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2f251b_0%,#101723_38%,#060a12_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.30em] text-[#d7ab5b]">Strate Homes Admin</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Consola interna</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">Monitorea cuentas, salud operativa, billing manual, actividad y soporte seguro.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/activity" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Actividad</Link>
              <Link href="/admin/export/workspaces" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">CSV cuentas</Link>
              <Link href="/admin/export/conversions" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">CSV conversión</Link>
              <Link href="/app" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Abrir app cliente</Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
          {[
            { label: "Inmobiliarias", value: state.totals.workspaces },
            { label: "Activas", value: state.totals.activeWorkspaces },
            { label: "Usuarios", value: state.totals.users },
            { label: "Propiedades", value: state.totals.properties },
            { label: "Publicadas", value: state.totals.publishedProperties },
            { label: "Leads", value: state.totals.leads },
            { label: "Followups", value: state.totals.openFollowups },
            { label: "Sin actividad", value: state.totals.staleAccounts },
            { label: "Publicidad", value: state.totals.adRequests },
            { label: "Conversión 7d", value: state.totals.conversions7d },
            { label: "WhatsApp 7d", value: state.totals.whatsappClicks7d },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{item.label}</p>
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          {Object.entries(state.salesPipeline).map(([status, count]) => (
            <article key={status} className="rounded-[1.6rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d7ab5b]">{commercialStatusLabel(status)}</p>
              <p className="mt-4 text-3xl font-semibold">{count}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
          <form className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
            <input name="q" defaultValue={params?.q ?? ""} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Buscar por inmobiliaria, slug, owner o correo" />
            <select name="health" defaultValue={params?.health ?? ""} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none">
              <option value="">Salud</option>
              <option value="critical">Crítica</option>
              <option value="medium">Media</option>
              <option value="healthy">Sana</option>
            </select>
            <select name="alert" defaultValue={params?.alert ?? ""} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none">
              <option value="">Alertas</option>
              <option value="no_logo">Sin logo</option>
              <option value="no_active_properties">Sin activas</option>
              <option value="no_leads">Sin leads</option>
              <option value="no_activity">Sin actividad</option>
            </select>
            <button className="rounded-2xl bg-[#d7ab5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c99a46]">Filtrar</button>
          </form>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="border-b border-white/10 px-5 py-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Cuentas</p>
              <h2 className="mt-2 text-2xl font-semibold">Inmobiliarias y salud operativa</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-white/42">
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-4 font-medium">Inmobiliaria</th>
                    <th className="px-5 py-4 font-medium">Tipo cuenta</th>
                    <th className="px-5 py-4 font-medium">Equipo</th>
                    <th className="px-5 py-4 font-medium">Inventario</th>
                    <th className="px-5 py-4 font-medium">Leads</th>
                    <th className="px-5 py-4 font-medium">Salud</th>
                  </tr>
                </thead>
                <tbody>
                  {state.workspaces.map((workspace) => (
                    <tr key={workspace.id} className="border-b border-white/10 text-white/72 last:border-0">
                      <td className="px-5 py-4">
                        <Link href={`/admin/workspaces/${workspace.id}`} className="font-semibold text-white transition hover:text-[#d7ab5b]">{workspace.brand_name ?? workspace.name}</Link>
                        <p className="mt-1 text-xs text-white/42">/{workspace.slug} · {workspace.owner_email ?? "sin owner"}</p>
                        {workspace.alerts[0] ? <p className="mt-2 text-xs text-amber-100">{workspace.alerts.slice(0, 2).join(" · ")}</p> : null}
                      </td>
                      <td className="px-5 py-4">{getPlanLabel(workspace.subscription?.plan)} · {workspace.subscription?.status ?? "trial"}</td>
                      <td className="px-5 py-4">{workspace.users_count} usuarios · {workspace.agents_count} asesores</td>
                      <td className="px-5 py-4">{workspace.published_count}/{workspace.properties_count} publicadas</td>
                      <td className="px-5 py-4">{workspace.leads_count} · {workspace.stale_leads_count} alerta</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthClass(workspace.health_score)}`}>{workspace.health_score}%</span>
                      </td>
                    </tr>
                  ))}
                  {!state.workspaces.length ? <tr><td colSpan={6} className="px-5 py-8 text-center text-white/50">No hay cuentas con esos filtros.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="space-y-5">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">Actividad</p>
                  <h2 className="mt-2 text-2xl font-semibold">Últimos eventos</h2>
                </div>
                <Link href="/admin/export/activity" className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/70">CSV</Link>
              </div>
              <div className="mt-5"><ActivityList activity={state.activity} /></div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Publicidad</p>
              <h2 className="mt-2 text-2xl font-semibold">Solicitudes de campaña</h2>
              <div className="mt-5 space-y-3">
                {state.adCampaignRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <div className="flex flex-col gap-3">
                      <div>
                        <Link href={`/admin/workspaces/${request.workspace_id}`} className="text-sm font-semibold text-white transition hover:text-[#d7ab5b]">{request.workspace_name ?? "Inmobiliaria"}</Link>
                        <p className="mt-1 text-xs text-white/45">{request.channels.join(", ") || "sin canal"} · {request.objective} · {request.status}</p>
                        <p className="mt-1 text-xs text-white/45">{request.property_title ?? "Campaña general"} · {request.monthly_budget_mxn ? `$${request.monthly_budget_mxn.toLocaleString("es-MX")} MXN` : "presupuesto por definir"}</p>
                        <p className="mt-2 text-xs text-white/60">{request.visits_count} visitas · {request.whatsapp_clicks_count} WhatsApp · {request.lead_forms_count} formularios</p>
                        <a href={buildCampaignUrl(request)} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-[#d7ab5b] underline-offset-4 hover:underline">{buildCampaignUrl(request)}</a>
                      </div>
                      <div className="rounded-2xl bg-white p-2 text-slate-950">
                        <AdCampaignStatusForm request={request} />
                      </div>
                    </div>
                  </div>
                ))}
                {!state.adCampaignRequests.length ? <p className="text-sm text-white/50">Sin solicitudes de publicidad.</p> : null}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Anuncios</p>
              <div className="mt-4 space-y-3">
                {state.announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{announcement.title}</p>
                        <p className="mt-1 text-xs text-white/45">{announcement.audience} · {announcement.is_active ? "activo" : "inactivo"}</p>
                      </div>
                      <AnnouncementToggleForm announcementId={announcement.id} isActive={announcement.is_active} />
                    </div>
                  </div>
                ))}
                {!state.announcements.length ? <p className="text-sm text-white/50">Sin anuncios.</p> : null}
              </div>
              <div className="mt-5 rounded-2xl bg-white p-4 text-slate-950">
                <AnnouncementForm />
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
