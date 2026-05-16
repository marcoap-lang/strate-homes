import Link from "next/link";

const outcomes = [
  "Tu inmobiliaria con sitio público premium",
  "Propiedades listas para compartirse por asesor",
  "Leads con responsable, seguimiento y WhatsApp",
  "Operación clara para equipos pequeños o asesores independientes",
];

const useCases = [
  {
    title: "Asesor independiente",
    description: "Opera con nombre comercial propio, publica propiedades y recibe leads sin depender de una página improvisada.",
  },
  {
    title: "Inmobiliaria pequeña",
    description: "Centraliza inventario, asesores, branding y seguimiento para que nadie pierda oportunidades por falta de orden.",
  },
  {
    title: "Agencia en crecimiento",
    description: "Da estructura comercial al equipo con presencia pública elegante, pipeline básico y control interno de calidad.",
  },
];

const capabilities = [
  ["Sitio público", "Página premium por inmobiliaria, fichas de propiedad y perfiles personales de asesores."],
  ["Inventario", "Alta de propiedades, fotos, portada sugerida, estado de publicación y score de calidad."],
  ["CRM simple", "Leads, responsable, próximo contacto, notas, tareas y templates de WhatsApp."],
  ["Operación Strate", "Consola interna para soporte, salud de cuentas, planes manuales y seguimiento comercial."],
];

const plans = [
  {
    name: "Solo Asesor",
    price: "Para iniciar",
    description: "Presencia profesional e inventario propio para vender como marca personal.",
    features: ["1 asesor principal", "Sitio público", "Propiedades activas limitadas", "Leads y WhatsApp"],
  },
  {
    name: "Inmobiliaria Pequeña",
    price: "Más equipo",
    description: "Para equipos que necesitan orden comercial y una imagen pública consistente.",
    features: ["Varios asesores", "Inventario compartido", "Pipeline comercial", "Tours y perfiles públicos"],
  },
  {
    name: "Agencia",
    price: "Operación completa",
    description: "Para inmobiliarias que quieren control, reportes y acompañamiento comercial.",
    features: ["Más capacidad", "Métricas comerciales", "Soporte prioritario", "Preparado para integraciones"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efe6] text-[#15110d]">
      <header className="border-b border-[#d8c9b4]/60 bg-[#f7f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a18461]">Strate Homes</p>
            <p className="mt-1 text-sm text-[#4d4236]">Presencia y operación inmobiliaria</p>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login?next=/admin" className="rounded-full border border-[#d8c9b4] bg-transparent px-3 py-2.5 text-sm font-medium text-[#6d5c49] transition hover:bg-white/60 hover:text-[#15110d] sm:px-4">
              Admin
            </Link>
            <Link href="/login" className="rounded-full border border-[#d8c9b4] bg-white/65 px-3 py-2.5 text-sm font-semibold text-[#2a2118] transition hover:bg-white sm:px-4">
              Entrar
            </Link>
            <Link href="/properties" className="hidden rounded-full bg-[#18120d] px-4 py-2.5 text-sm font-semibold text-[#fff8ee] transition hover:bg-[#2a2118] sm:inline-flex">
              Ver ejemplo público
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_18%,rgba(215,171,91,0.28),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(40,32,24,0.12),transparent_34%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-[#d8c9b4] bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8a6a43] shadow-sm">
              Para vender propiedades con mejor imagen y seguimiento
            </p>
            <h1 className="mt-7 max-w-4xl font-serif text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-[#17120e] sm:text-7xl lg:text-8xl">
              La app comercial para inmobiliarias que quieren lucir y operar mejor.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#655848]">
              Strate Homes combina sitio público premium, inventario, asesores, leads y seguimiento en una experiencia pensada para asesores independientes e inmobiliarias pequeñas o medianas.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex justify-center rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-semibold text-[#17120e] shadow-[0_18px_40px_rgba(215,171,91,0.28)] transition hover:bg-[#e3ba72]">
                Entrar a mi app
              </Link>
              <Link href="/properties" className="inline-flex justify-center rounded-full border border-[#d8c9b4] bg-white/70 px-6 py-4 text-sm font-semibold text-[#2a2118] transition hover:bg-white">
                Ver demo pública
              </Link>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {outcomes.map((item) => (
                <div key={item} className="rounded-2xl border border-[#dccfbd] bg-white/58 px-4 py-3 text-sm font-medium text-[#3c3127]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-[#17120e] opacity-[0.06] blur-3xl" />
            <div className="relative rounded-[2.5rem] border border-[#d8c9b4] bg-[#17120e] p-5 text-[#fff8ee] shadow-[0_34px_90px_rgba(43,33,24,0.22)]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Flujo comercial</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.04em]">Publica, captura, da seguimiento.</h2>
                <div className="mt-8 space-y-3">
                  {[
                    ["01", "Configura tu inmobiliaria", "Logo, claim, contacto y sitio público."],
                    ["02", "Carga propiedades con fotos", "Score de publicación y portada sugerida."],
                    ["03", "Recibe leads accionables", "Responsable, WhatsApp, notas y próxima tarea."],
                    ["04", "Mide lo que convierte", "Fuente, clicks y actividad comercial básica."],
                  ].map(([step, title, description]) => (
                    <div key={step} className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{step}</p>
                      <p className="mt-2 text-lg font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/58">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-[2rem] border border-[#dccfbd] bg-white/68 p-6 shadow-[0_18px_50px_rgba(43,33,24,0.06)]">
                <h2 className="font-serif text-3xl font-semibold tracking-[-0.04em] text-[#17120e]">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#655848]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a6a43]">Qué incluye</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#17120e] sm:text-5xl">
              Lo suficiente para vender ya, sin cargarle complejidad al equipo.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map(([title, description]) => (
              <article key={title} className="rounded-[1.8rem] border border-[#dccfbd] bg-[#fffaf3] p-5">
                <h3 className="text-xl font-semibold text-[#17120e]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#655848]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.6rem] bg-[#17120e] p-6 text-[#fff8ee] shadow-[0_30px_90px_rgba(43,33,24,0.20)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#d7ab5b]">Planes iniciales</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Paquetes claros para empezar a vender.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/58">Billing manual en esta etapa: ideal para pilotos acompañados, demos y primeros clientes antes de automatizar cobros.</p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#d7ab5b]">{plan.price}</p>
                <h3 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.04em]">{plan.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{plan.description}</p>
                <div className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <p key={feature} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/75">{feature}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2.4rem] border border-[#dccfbd] bg-white/70 p-7 shadow-[0_24px_70px_rgba(43,33,24,0.08)] lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Siguiente paso</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.05em] text-[#17120e]">Activa una demo y vende con una presencia más seria.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#655848]">El producto está preparado para onboarding acompañado: configurar marca, cargar propiedades, publicar y revisar leads en una misma semana.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="rounded-full bg-[#17120e] px-6 py-4 text-center text-sm font-semibold text-[#fff8ee] transition hover:bg-[#2a2118]">
              Entrar a mi app
            </Link>
            <Link href="/login?next=/admin" className="rounded-full border border-[#d8c9b4] bg-[#fffaf3] px-6 py-4 text-center text-sm font-semibold text-[#2a2118] transition hover:bg-white">
              Admin Strate
            </Link>
            <Link href="/properties" className="rounded-full border border-[#d8c9b4] bg-white px-6 py-4 text-center text-sm font-semibold text-[#2a2118] transition hover:bg-[#fffaf3]">
              Ver demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
