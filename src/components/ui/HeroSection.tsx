export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pt-28">
      <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-zinc-900/10 bg-white px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-zinc-600 shadow-sm">
            Plataforma inmobiliaria premium
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
            La capa comercial que las inmobiliarias modernas realmente necesitan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Strate Homes combina presencia pública elegante, administración de propiedades,
            captación de leads, CRM comercial y base multiworkspace para operar con orden y convertir mejor.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#contact" className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
              Solicitar demo
            </a>
            <a href="#features" className="rounded-full border border-zinc-900/10 bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-900/20 hover:bg-zinc-50">
              Ver plataforma
            </a>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/60 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="rounded-[1.5rem] bg-zinc-950 p-6 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Workspace dashboard</p>
            <div className="mt-6 space-y-4">
              {[
                ["Propiedades activas", "128"],
                ["Leads hoy", "42"],
                ["Respuesta promedio", "7 min"],
                ["Tasa de conversión", "18.4%"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-white/70">{label}</span>
                  <span className="text-lg font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
