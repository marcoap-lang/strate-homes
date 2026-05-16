import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CompleteFollowupButton,
  FeatureFlagForm,
  OwnerChangeForm,
  SubscriptionForm,
  WorkspaceFollowupForm,
  WorkspaceNoteForm,
  WorkspaceStatusForm,
} from "@/components/ui/PlatformAdminForms";
import { getPlatformWorkspaceDetail } from "@/lib/platform-admin";

function healthClass(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 55) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] ${className}`}>{children}</section>;
}

function titleize(value: string) {
  return value.replaceAll("_", " ");
}

export default async function PlatformWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = await getPlatformWorkspaceDetail(id);

  if (state.kind === "no-session") redirect("/login?next=/admin");
  if (state.kind === "forbidden") redirect("/admin");
  if (state.kind === "not-found") notFound();

  const { workspace } = state;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">← Admin interno</Link>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{workspace.brand_name ?? workspace.name}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">/{workspace.slug} · {workspace.owner_email ?? "sin owner visible"} · {workspace.is_active ? "activa" : "pausada"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={workspace.public_url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Sitio público</a>
              <a href={`${workspace.public_url}/properties`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Inventario público</a>
              <Link href="/admin/export/leads" className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">CSV leads</Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            ["Salud", `${workspace.health_score}%`],
            ["Plan", workspace.subscription?.plan ?? "solo"],
            ["Cuenta", workspace.subscription?.status ?? "trial"],
            ["Usuarios", workspace.users_count],
            ["Publicadas", `${workspace.published_count}/${workspace.properties_count}`],
            ["Leads alerta", workspace.stale_leads_count],
          ].map(([label, value]) => (
            <Card key={label.toString()}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5">
            <Card>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Alertas</p>
                  <h2 className="mt-2 text-2xl font-semibold">Diagnóstico de cuenta</h2>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${healthClass(workspace.health_score)}`}>{workspace.health_score}% salud</span>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {workspace.alerts.map((alert) => (
                  <div key={alert} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{alert}</div>
                ))}
                {!workspace.alerts.length ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Sin alertas operativas relevantes.</div> : null}
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Branding</p>
              <h2 className="mt-2 text-2xl font-semibold">Presencia pública</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <p><span className="font-semibold text-slate-950">Claim:</span> {workspace.public_claim ?? "Pendiente"}</p>
                <p><span className="font-semibold text-slate-950">Email:</span> {workspace.public_email ?? "Pendiente"}</p>
                <p><span className="font-semibold text-slate-950">Teléfono:</span> {workspace.public_phone ?? "Pendiente"}</p>
                <p><span className="font-semibold text-slate-950">WhatsApp:</span> {workspace.public_whatsapp ?? "Pendiente"}</p>
                <p><span className="font-semibold text-slate-950">Logo:</span> {workspace.public_logo_url ? "Configurado" : "Pendiente"}</p>
                <p><span className="font-semibold text-slate-950">Hero:</span> {workspace.public_hero_url ? "Configurado" : "Pendiente"}</p>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Equipo</p>
              <h2 className="mt-2 text-2xl font-semibold">Usuarios internos</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <tbody>
                    {state.members.map((member) => (
                      <tr key={member.membership_id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 font-semibold">{member.full_name ?? member.email ?? "Sin nombre"}</td>
                        <td className="py-3 text-slate-500">{member.email ?? "sin email"}</td>
                        <td className="py-3 text-slate-500">{member.role}</td>
                        <td className="py-3 text-slate-500">{member.is_active ? "activo" : "inactivo"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Inventario</p>
              <h2 className="mt-2 text-2xl font-semibold">Propiedades recientes</h2>
              <div className="mt-4 grid gap-3">
                {state.properties.slice(0, 8).map((property) => (
                  <div key={property.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{property.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{property.status} · {property.agent_name ?? "sin asesor"} · {property.images_count} fotos · {property.has_cover ? "con portada" : "sin portada"}</p>
                      </div>
                      <a href={`${workspace.public_url}/properties/${property.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-700">Ver pública</a>
                    </div>
                  </div>
                ))}
                {!state.properties.length ? <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Sin propiedades registradas.</p> : null}
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Leads</p>
              <h2 className="mt-2 text-2xl font-semibold">Leads recientes</h2>
              <div className="mt-4 grid gap-3">
                {state.leads.slice(0, 8).map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="font-semibold">{lead.full_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{lead.phone} · {lead.status} · {lead.assigned_agent_name ?? "sin responsable"} · {new Date(lead.created_at).toLocaleString("es-MX")}</p>
                  </div>
                ))}
                {!state.leads.length ? <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Sin leads recibidos.</p> : null}
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Billing manual</p>
              <h2 className="mt-2 text-2xl font-semibold">Plan y estado</h2>
              <div className="mt-4"><SubscriptionForm workspaceId={workspace.id} subscription={workspace.subscription!} /></div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Seguimiento comercial</p>
              <h2 className="mt-2 text-2xl font-semibold">Notas y followups</h2>
              <div className="mt-4 space-y-5">
                <WorkspaceNoteForm workspaceId={workspace.id} />
                <WorkspaceFollowupForm workspaceId={workspace.id} platformAdmins={state.platformAdmins} />
                <div className="space-y-2">
                  {state.followups.map((followup) => (
                    <div key={followup.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">{followup.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{followup.due_at ? new Date(followup.due_at).toLocaleString("es-MX") : "Sin fecha"} · {followup.assigned_email ?? "sin asignar"}</p>
                      </div>
                      <CompleteFollowupButton workspaceId={workspace.id} followup={followup} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Notas internas</p>
              <div className="mt-4 space-y-3">
                {state.notes.map((note) => (
                  <article key={note.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm leading-6">{note.body}</p>
                    <p className="mt-2 text-xs text-slate-400">{note.author_email ?? note.author_name ?? "Strate"} · {new Date(note.created_at).toLocaleString("es-MX")}</p>
                  </article>
                ))}
                {!state.notes.length ? <p className="text-sm text-slate-500">Sin notas internas todavía.</p> : null}
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Soporte seguro</p>
              <div className="mt-4 space-y-5">
                <OwnerChangeForm workspaceId={workspace.id} members={state.members} />
                <WorkspaceStatusForm workspaceId={workspace.id} isActive={workspace.is_active} />
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Para recovery de usuario, pídele abrir `/login?next=/app`, elegir Recuperar y usar su correo.
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Feature flags</p>
              <h2 className="mt-2 text-2xl font-semibold">Producto por cuenta</h2>
              <div className="mt-4 space-y-4">
                <FeatureFlagForm workspaceId={workspace.id} />
                {state.flags.map((flag) => (
                  <div key={flag.flag_key} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold">{flag.flag_key}</p>
                    <p className="mt-1 text-xs text-slate-500">{flag.enabled ? "activa" : "inactiva"} · {new Date(flag.updated_at).toLocaleString("es-MX")}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Historial</p>
              <div className="mt-4 space-y-3">
                {state.activity.slice(0, 10).map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold">{titleize(event.event_type)}</p>
                    <p className="mt-1 text-xs text-slate-500">{event.actor_email ?? "Sistema"} · {new Date(event.created_at).toLocaleString("es-MX")}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}
