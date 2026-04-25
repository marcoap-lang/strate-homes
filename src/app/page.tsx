import Image from "next/image";
import Link from "next/link";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { getPublicWorkspaceHome } from "@/lib/public-home";
import { buildWorkspacePropertyPath } from "@/lib/public-links";

export default async function Home() {
  const home = await getPublicWorkspaceHome();
  const workspaceName = home.workspace?.brandName ?? home.workspace?.name ?? "Azure Coast Realty";
  const workspaceSlug = home.workspace?.slug ?? null;
  const heroProperty = home.featuredProperties[0] ?? home.recentProperties[0] ?? null;
  const featuredAgent = home.featuredAgents[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-zinc-950">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f4ef]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.42em] text-zinc-800">{workspaceName}</p>
            <p className="mt-1 text-xs text-zinc-500">Miami coastal · minimal luxury</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            <Link href="/" className="transition hover:text-zinc-950">Inicio</Link>
            <Link href="/properties" className="transition hover:text-zinc-950">Propiedades</Link>
            <a href="#agents" className="transition hover:text-zinc-950">Agentes</a>
            <a href="#contact" className="transition hover:text-zinc-950">Contacto</a>
          </nav>
          <Link href="/properties" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50">
            Ver propiedades
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-16 pt-8 lg:px-8 lg:pb-24 lg:pt-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-[3rem] bg-white px-8 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.05)] sm:px-12 sm:py-14">
            <div>
              <p className="inline-flex rounded-full border border-zinc-900/10 bg-[#fbf8f4] px-4 py-1 text-xs uppercase tracking-[0.32em] text-zinc-500">
                Brokerage coastal
              </p>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
                Espacios luminosos, bien ubicados y listos para compartirse.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-zinc-600">
                Una experiencia pública sobria, elegante y navegable para descubrir propiedades, perfiles comerciales y links listos para WhatsApp.
              </p>
            </div>

            <div id="contact" className="mt-10 flex flex-wrap gap-4">
              <Link href="/properties" className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                Explorar propiedades
              </Link>
              <a href="#agents" className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50">
                Ver agentes
              </a>
              <a href="https://wa.me/?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20las%20propiedades%20publicadas." target="_blank" rel="noreferrer" className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50">
                Contacto por WhatsApp
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[3rem] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.05)]">
            <div className="relative min-h-[34rem] bg-gradient-to-br from-zinc-200 to-zinc-100 lg:min-h-[42rem]">
              {heroProperty?.coverImageUrl ? <Image src={heroProperty.coverImageUrl} alt={heroProperty.title} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              {heroProperty ? (
                <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/80">Propiedad destacada</p>
                  <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{heroProperty.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">{heroProperty.locationLabel}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <p className="text-lg font-medium">
                      {heroProperty.currencyCode} {heroProperty.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                    </p>
                    <Link href={buildWorkspacePropertyPath(workspaceSlug, heroProperty.slug)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/15">
                      Ver propiedad
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Destacadas</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Propiedades protagonistas con lectura editorial.</h2>
          </div>
          <Link href="/properties" className="hidden text-sm text-zinc-600 transition hover:text-zinc-950 md:inline-flex">Ver más propiedades</Link>
        </div>

        <div className="mt-8 space-y-6">
          {home.featuredProperties.slice(0, 3).map((property, index) => (
            <article key={property.id} className={`grid gap-0 overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.05)] ${index % 2 === 0 ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_1.1fr]"}`}>
              <div className={`relative min-h-[22rem] bg-gradient-to-br from-zinc-200 to-zinc-100 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
              </div>
              <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">{property.title}</h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-zinc-600">{property.locationLabel}</p>
                <p className="mt-6 text-lg font-medium text-zinc-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={buildWorkspacePropertyPath(workspaceSlug, property.slug)} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                    Ver propiedad
                  </Link>
                  <Link href="/properties" className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                    Ver más propiedades
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Recientes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Un inventario navegable y listo para compartirse.</h2>
          </div>
          <Link href="/properties" className="hidden text-sm text-zinc-600 transition hover:text-zinc-950 md:inline-flex">Ver todo</Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {home.recentProperties.slice(0, 6).map((property) => (
            <article key={property.id} className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
              <div className="relative h-72 bg-gradient-to-br from-zinc-200 to-zinc-100">
                {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</p>
                <h3 className="mt-4 text-2xl font-semibold text-zinc-950">{property.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{property.locationLabel}</p>
                <p className="mt-5 text-base font-medium text-zinc-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                <Link href={buildWorkspacePropertyPath(workspaceSlug, property.slug)} className="mt-6 inline-flex rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="agents" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Agentes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Atención comercial visible y cercana.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-600">
              Un perfil comercial claro ayuda a que el cliente confíe más rápido, pregunte mejor y comparta propiedades con más contexto.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://wa.me/?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20sus%20propiedades." target="_blank" rel="noreferrer" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                Contactar por WhatsApp
              </a>
            </div>
          </div>

          {featuredAgent ? (
            <article className="overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.05)]">
              <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                <div className="relative min-h-[24rem] bg-zinc-100">
                  {featuredAgent.avatarUrl ? <Image src={featuredAgent.avatarUrl} alt={featuredAgent.displayName} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Agente destacado</p>
                  <h3 className="mt-4 text-3xl font-semibold text-zinc-950">{featuredAgent.displayName}</h3>
                  <p className="mt-3 text-sm uppercase tracking-[0.25em] text-zinc-500">{featuredAgent.title ?? "Asesor comercial"}</p>
                  <p className="mt-5 text-sm leading-8 text-zinc-600">{featuredAgent.bio ?? "Perfil comercial visible dentro del sitio público del workspace."}</p>
                </div>
              </div>
            </article>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-black/10 bg-white p-6 text-sm text-zinc-600">
              Todavía no hay agentes públicos visibles en este workspace.
            </div>
          )}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8">
        <div className="rounded-[2.5rem] border border-black/5 bg-white px-8 py-8 shadow-sm sm:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{workspaceName}</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">
                ¡ INFORMACIÓN IMPORTANTE !
                <br />
                Las imágenes, fotografías, videos, información, medidas, características, descripciones, disponibilidad, precio y descuentos son aproximados y deberán confirmarse y ratificarse con la documentación correspondiente, únicamente se presenta con fines ilustrativos e informativos y corresponde a la última información recabada al propietario, constructor y/o desarrollador, por lo cual, no representa ninguna oferta vinculante ni contractual.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              <Link href="/">Inicio</Link>
              <Link href="/properties">Propiedades</Link>
              <a href="#agents">Agentes</a>
              <a href="#contact">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
