import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminAccessClient } from "@/components/ui/AdminAccessClient";
import { AdminShell } from "@/components/ui/AdminShell";
import { getAdminAccessState } from "@/lib/admin-access";

function statusClass(done: boolean) {
  return done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800";
}

export default async function AppOnboardingPage() {
  const access = await getAdminAccessState();

  if (access.kind === "no-session") redirect("/login?next=/app/onboarding");

  if (access.kind !== "ready") {
    return (
      <AdminShell>
        <AdminAccessClient />
      </AdminShell>
    );
  }

  const steps = [
    {
      title: "Define tu inmobiliaria",
      description: "Nombre público, claim, bio y datos de contacto. Esto es lo que verá el comprador.",
      done: Boolean(access.activeWorkspace.brandName && access.activeWorkspace.publicClaim),
      href: "/app/public",
      action: "Configurar marca",
    },
    {
      title: "Sube un logo legible",
      description: "El logo debe verse bien en móvil, sobre fondos claros y oscuros.",
      done: Boolean(access.activeWorkspace.publicLogoUrl),
      href: "/app/public",
      action: "Subir logo",
    },
    {
      title: "Crea tus asesores",
      description: "Cada asesor puede tener perfil público y propiedades dirigidas hacia él o ella.",
      done: access.agents.length > 0,
      href: "/app/team",
      action: "Configurar equipo",
    },
    {
      title: "Carga la primera propiedad",
      description: "Empieza con una propiedad vendible: precio, ubicación, descripción y responsable.",
      done: access.properties.length > 0,
      href: "/app/properties/new",
      action: "Agregar propiedad",
    },
    {
      title: "Ordena fotos y portada",
      description: "La primera imagen decide si alguien sigue mirando. Sube fotos claras y marca portada.",
      done: access.properties.some((property) => property.property_images.length > 0),
      href: "/app/properties",
      action: "Revisar fotos",
    },
    {
      title: "Publica y comparte",
      description: "Cuando la ficha esté lista, actívala y compártela desde el sitio público o WhatsApp.",
      done: access.properties.some((property) => property.status === "active"),
      href: "/app/public/properties",
      action: "Publicar inventario",
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <AdminShell>
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-[color:var(--admin-line)] bg-[linear-gradient(135deg,#07101f_0%,#172233_52%,#2c241b_100%)] p-6 text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Inicio acompañado</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">De cuenta nueva a inmobiliaria lista para vender.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
            Completa estos pasos en orden. La meta no es llenar campos: es que tu marca, asesores, propiedades y seguimiento queden listos para recibir compradores.
          </p>
          <div className="mt-6 max-w-xl">
            <div className="flex items-center justify-between text-sm">
              <span>{completed} de {steps.length} pasos completos</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-[#d7ab5b]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-[1.8rem] border border-[color:var(--admin-line)] bg-white p-6 shadow-[0_16px_35px_rgba(20,33,61,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Paso {index + 1}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{step.title}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(step.done)}`}>
                  {step.done ? "Listo" : "Pendiente"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
              <Link href={step.href} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                {step.action}
              </Link>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
