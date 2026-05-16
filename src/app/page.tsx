import Link from "next/link";

const productPillars = [
  {
    title: "Inventario ordenado",
    description: "Propiedades, fotos, estatus y presentación pública en un flujo claro para equipos inmobiliarios.",
  },
  {
    title: "Presencia pública premium",
    description: "Sitios por inmobiliaria, páginas de propiedad y perfiles de asesores con una estética limpia y comercial.",
  },
  {
    title: "Operación lista para crecer",
    description: "Base multiusuario, roles, leads iniciales y estructura preparada para CRM, campañas y automatización.",
  },
];

const roadmap = ["App móvil", "Inventario público", "Leads básicos", "Branding editable", "Equipo comercial", "Automatización futura"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-slate-950">
      <header className="border-b border-black/5 bg-[#f6f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-500">Strate Homes</p>
            <p className="mt-1 text-sm text-slate-700">Real estate operating system</p>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login?next=/admin" className="hidden rounded-full border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white/65 hover:text-slate-950 md:inline-flex">
              Admin Strate
            </Link>
            <Link href="/login" className="rounded-full border border-slate-300 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-white">
              Entrar
            </Link>
            <Link href="/properties" className="hidden rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:inline-flex">
              Ver demo pública
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-600 shadow-sm">
              SaaS inmobiliario en construcción
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Una app más clara para vender propiedades con mejor presencia.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Strate Homes está naciendo como una plataforma para inmobiliarias y asesores: inventario, páginas públicas, equipo, leads y operación comercial desde un solo lugar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex justify-center rounded-full bg-[#d7ab5b] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(215,171,91,0.28)] transition hover:bg-[#c99a46]">
                Entrar a la app
              </Link>
              <Link href="/login?next=/admin" className="inline-flex justify-center rounded-full border border-slate-300 bg-white/55 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white sm:hidden">
                Admin Strate
              </Link>
              <Link href="/properties" className="inline-flex justify-center rounded-full border border-slate-300 bg-white/75 px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-white">
                Explorar demo pública
              </Link>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-white/70 bg-white/75 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
            <div className="rounded-[1.8rem] bg-slate-950 p-5 text-white sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">App preview</p>
                  <h2 className="mt-3 text-2xl font-semibold">Operación inmobiliaria</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Beta</span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["Propiedades", "Inventario y publicación"],
                  ["Fotos", "Galería y portada"],
                  ["Leads", "Seguimiento inicial"],
                  ["Equipo", "Roles y asesores"],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-base font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-sm font-medium text-white">Enfoque actual</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Hacer que la app sea cómoda en celular antes de seguir agregando módulos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {productPillars.map((pillar) => (
              <article key={pillar.title} className="rounded-[1.8rem] border border-black/5 bg-white/70 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-black/5 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Roadmap visible</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Primero operación sólida. Luego automatización.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
                  La prioridad es que cargar, editar y publicar propiedades se sienta profesional desde computadora y celular.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roadmap.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/75">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
