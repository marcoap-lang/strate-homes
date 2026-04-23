const features = [
  {
    title: "Presencia pública premium",
    description:
      "Landing, páginas de propiedades y perfiles públicos diseñados para confianza, claridad y conversión.",
  },
  {
    title: "CRM comercial real",
    description:
      "Leads, seguimiento, pipeline y contexto comercial para que nada se pierda entre visitas y conversaciones.",
  },
  {
    title: "Multiworkspace preparado",
    description:
      "Pensado para agente individual, equipo o inmobiliaria con branding y permisos por contexto.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Plataforma</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Una base pensada para vender mejor, no solo para mostrar propiedades.
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-950">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-600">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
