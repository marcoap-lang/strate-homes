export function CTASection() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="rounded-[2rem] bg-zinc-950 px-6 py-12 text-white md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Siguiente paso</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Construyamos una plataforma inmobiliaria que se vea premium y opere en serio.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              El siguiente bloque natural es definir el modelo de propiedades, leads y administración para conectar la experiencia pública con el core comercial.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="mailto:hello@stratehomes.com" className="rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">
              Escribir por email
            </a>
            <a href="#" className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-white/5">
              Abrir plan de producto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
