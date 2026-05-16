import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlatformAdminState } from "@/lib/platform-admin";

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
  };

  return labels[value] ?? value.replaceAll("_", " ");
}

function healthClass(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 55) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

export default async function AdminPage() {
  const state = await getPlatformAdminState();

  if (state.kind === "no-session") {
    redirect("/login");
  }

  if (state.kind === "forbidden") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Strate Homes Admin</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Acceso interno restringido</h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            Este `/admin` queda reservado para operación interna de Strate. La app de la inmobiliaria vive en `/app`.
          </p>
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/70">
            Usuario actual: {state.email ?? "sin email visible"}. Para habilitarlo, agrégalo a `platform_admins` o a `STRATE_PLATFORM_ADMIN_EMAILS`.
          </p>
          <Link href="/app" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90">
            Ir a la app del cliente
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2f251b_0%,#101723_38%,#060a12_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.30em] text-[#d7ab5b]">Strate Homes Admin</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Operación interna</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
                Vista de salud para vender, monitorear y dar soporte a inmobiliarias sin entrar a ciegas a cada cuenta.
              </p>
            </div>
            <Link href="/app" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15">
              Abrir app cliente
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Inmobiliarias", value: state.totals.workspaces },
            { label: "Activas", value: state.totals.activeWorkspaces },
            { label: "Usuarios", value: state.totals.users },
            { label: "Propiedades", value: state.totals.properties },
            { label: "Publicadas", value: state.totals.publishedProperties },
            { label: "Leads", value: state.totals.leads },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{item.label}</p>
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
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
                    <th className="px-5 py-4 font-medium">Owner</th>
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
                        <p className="font-semibold text-white">{workspace.brand_name ?? workspace.name}</p>
                        <p className="mt-1 text-xs text-white/42">/{workspace.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{workspace.owner_name ?? "Sin owner visible"}</p>
                        <p className="mt-1 text-xs text-white/42">{workspace.owner_email ?? "Email pendiente"}</p>
                      </td>
                      <td className="px-5 py-4">{workspace.users_count} usuarios · {workspace.agents_count} asesores</td>
                      <td className="px-5 py-4">{workspace.published_count}/{workspace.properties_count} publicadas</td>
                      <td className="px-5 py-4">{workspace.leads_count}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthClass(workspace.health_score)}`}>
                          {workspace.health_score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!state.workspaces.length ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-white/50">Todavía no hay inmobiliarias registradas.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="space-y-5">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Alertas</p>
              <h2 className="mt-2 text-2xl font-semibold">Dónde intervenir</h2>
              <div className="mt-5 space-y-3 text-sm">
                {state.workspaces.filter((workspace) => workspace.health_score < 65).slice(0, 5).map((workspace) => (
                  <div key={workspace.id} className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-amber-50">
                    <p className="font-semibold">{workspace.brand_name ?? workspace.name}</p>
                    <p className="mt-1 text-xs text-amber-50/65">Salud {workspace.health_score}%. Revisar onboarding, publicación o leads.</p>
                  </div>
                ))}
                {!state.workspaces.some((workspace) => workspace.health_score < 65) ? (
                  <div className="rounded-2xl border border-emerald-200/20 bg-emerald-200/10 px-4 py-3 text-emerald-50">
                    No hay cuentas críticas por ahora.
                  </div>
                ) : null}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Actividad reciente</p>
              <div className="mt-4 space-y-3">
                {state.activity.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <p className="text-sm font-semibold">{formatEventLabel(event.event_type)}</p>
                    <p className="mt-1 text-xs text-white/45">{event.workspace_name ?? "Sistema"} · {new Date(event.created_at).toLocaleString("es-MX")}</p>
                  </div>
                ))}
                {!state.activity.length ? (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm text-white/50">Aún no hay actividad registrada.</p>
                ) : null}
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
