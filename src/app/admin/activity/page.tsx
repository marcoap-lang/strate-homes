import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlatformActivityState } from "@/lib/platform-admin";

function formatEventLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function PlatformActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspaceId?: string; eventType?: string; days?: string }>;
}) {
  const params = await searchParams;
  const days = params?.days ? Number(params.days) : 30;
  const state = await getPlatformActivityState({
    workspaceId: params?.workspaceId || null,
    eventType: params?.eventType || null,
    days: Number.isFinite(days) ? days : 30,
  });

  if (state.kind === "no-session") redirect("/login?next=/admin");
  if (state.kind === "forbidden") redirect("/admin");

  const eventTypes = Array.from(new Set(state.activity.map((event) => event.event_type))).sort();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#edf3f8_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1300px] space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">← Admin interno</Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Actividad del sistema</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Feed global con filtros por cuenta, tipo de evento y ventana temporal.</p>
        </header>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <form className="grid gap-3 lg:grid-cols-[1fr_220px_160px_auto]">
            <select name="workspaceId" defaultValue={params?.workspaceId ?? ""} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950">
              <option value="">Todas las inmobiliarias</option>
              {state.workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>{workspace.name} /{workspace.slug}</option>
              ))}
            </select>
            <select name="eventType" defaultValue={params?.eventType ?? ""} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950">
              <option value="">Todos los eventos</option>
              {eventTypes.map((eventType) => (
                <option key={eventType} value={eventType}>{formatEventLabel(eventType)}</option>
              ))}
            </select>
            <select name="days" defaultValue={String(days)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950">
              <option value="7">7 días</option>
              <option value="30">30 días</option>
              <option value="90">90 días</option>
              <option value="365">365 días</option>
            </select>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Filtrar</button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Eventos</p>
              <h2 className="mt-2 text-2xl font-semibold">{state.activity.length} registros</h2>
            </div>
            <Link href="/admin/export/activity" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Export CSV</Link>
          </div>

          <div className="space-y-3">
            {state.activity.map((event) => (
              <article key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{formatEventLabel(event.event_type)}</p>
                    <p className="mt-1 text-sm text-slate-500">{event.workspace_name ?? "Sistema"} · {event.actor_email ?? event.actor_name ?? "sin actor"}</p>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(event.created_at).toLocaleString("es-MX")}</p>
                </div>
                {Object.keys(event.metadata).length ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-white px-3 py-2 text-xs text-slate-500">{JSON.stringify(event.metadata, null, 2)}</pre>
                ) : null}
              </article>
            ))}
            {!state.activity.length ? <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">No hay eventos con esos filtros.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
