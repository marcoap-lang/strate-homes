import { redirect } from "next/navigation";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminShell } from "@/components/ui/AdminShell";
import { getAdminAccessState } from "@/lib/admin-access";
import { commercialPlans, getPlanLabel, type CommercialPlanKey } from "@/lib/commercial";

const planOrder: CommercialPlanKey[] = ["solo", "small_agency", "agency"];

function getPlanKey(plan?: string | null): CommercialPlanKey {
  if (plan === "small_agency" || plan === "agency") return plan;
  return "solo";
}

function capacityClass(value: number, limit: number) {
  if (value > limit) return "border-amber-200 bg-amber-50";
  if (value >= limit * 0.85) return "border-[#d7ab5b]/40 bg-[#fff8ec]";
  return "border-slate-100 bg-slate-50";
}

function formatPrice(value: number) {
  return value === 0 ? "$0 MXN" : `$${value.toLocaleString("es-MX")} MXN`;
}

export default async function SubscriptionPage() {
  const access = await getAdminAccessState();

  if (access.kind === "no-session") redirect("/login?next=/app/subscription");

  if (access.kind !== "ready") {
    return (
      <AdminShell>
        <AdminAccessClient />
      </AdminShell>
    );
  }

  const planKey = getPlanKey(access.subscription?.plan);
  const plan = commercialPlans[planKey];
  const teamCapacityItems = [
    {
      label: "Asesores",
      value: access.agents.length,
      limit: plan.limits.agents,
      helper: "Perfiles comerciales que atienden clientes y propiedades.",
    },
    {
      label: "Usuarios internos",
      value: access.teamMembers.length,
      limit: plan.limits.internalUsers,
      helper: "Personas con acceso operativo.",
    },
  ];
  const usageItems = [
    ["Propiedades activas", access.properties.filter((property) => property.status === "active").length, "Inventario visible para compradores."],
    ["Propiedades registradas", access.properties.length, "Inventario total dentro de la cuenta."],
    ["Recorridos", access.tours.length, "Selecciones compartibles para clientes."],
    ["Interesados registrados", access.leads.length, "Contactos recibidos y cargados por el equipo."],
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[color:var(--admin-line)] bg-[linear-gradient(135deg,#07101f_0%,#172233_58%,#2c241b_100%)] p-6 text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Suscripción</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{getPlanLabel(access.subscription?.plan)}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">{plan.description}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-[#d7ab5b]/35 bg-[#d7ab5b]/15 px-3 py-2 text-[#f6d79c]">Cobro actual: {formatPrice(plan.monthlyPrice)}</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Cuenta: {access.subscription?.status ?? "trial"}</span>
            {access.subscription?.trial_ends_at ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Trial hasta {new Date(access.subscription.trial_ends_at).toLocaleDateString("es-MX")}</span> : null}
            {access.subscription?.current_period_ends_at ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Periodo hasta {new Date(access.subscription.current_period_ends_at).toLocaleDateString("es-MX")}</span> : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {teamCapacityItems.map((item) => (
            <article key={item.label} className={`rounded-[1.7rem] border p-5 shadow-[0_16px_35px_rgba(20,33,61,0.05)] ${capacityClass(item.value, item.limit)}`}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-4xl font-semibold text-slate-950">{item.value}</p>
                <p className="text-sm font-semibold text-slate-500">Límite {item.limit}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#d7ab5b]" style={{ width: `${Math.min(100, Math.round((item.value / item.limit) * 100))}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.helper}</p>
              {item.value > item.limit ? <p className="mt-3 rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">Esta cuenta supera la capacidad incluida.</p> : null}
            </article>
          ))}
        </section>

        <section className="rounded-[1.8rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Uso actual</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Inventario y actividad sin límite por plan.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Strate Homes limita la capacidad por tamaño de equipo, no por cantidad de propiedades. La idea es que la inmobiliaria publique y trabaje su inventario con libertad.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {usageItems.map(([label, value, helper]) => (
              <article key={label.toString()} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Planes disponibles</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Opciones para crecer cuando la operación lo pida.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            De momento el cobro queda simbólico en $0 mientras se valida el producto con las primeras inmobiliarias. Más adelante se podrá activar precio real por plan desde Strate.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {planOrder.map((key) => {
              const option = commercialPlans[key];
              const isCurrent = key === planKey;
              return (
                <article key={key} className={`rounded-[1.7rem] border p-5 ${isCurrent ? "border-[#d7ab5b] bg-[#fff8ec]" : "border-slate-100 bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{option.audience}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950">{option.label}</h3>
                    </div>
                    {isCurrent ? <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">Actual</span> : null}
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{formatPrice(option.monthlyPrice)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <p>Inventario sin límite operativo</p>
                    <p>{option.limits.agents} asesores</p>
                    <p>{option.limits.internalUsers} usuarios internos</p>
                    <p>Recorridos e interesados sin bloqueo inicial</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {option.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
