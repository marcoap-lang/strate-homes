import Image from "next/image";
import Link from "next/link";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { getPublicWorkspaceHome } from "@/lib/public-home";
import { buildWorkspacePropertyPath } from "@/lib/public-links";

export default async function Home() {
  const home = await getPublicWorkspaceHome();
  const workspaceName = home.workspace?.brandName ?? home.workspace?.name ?? "Strate Homes Veracruz";
  const workspaceSlug = home.workspace?.slug ?? null;
  const heroProperty = home.featuredProperties[0] ?? home.recentProperties[0] ?? null;
  const featuredAgent = home.featuredAgents[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-950">
      <header className="sticky top-0 z-50 bg-[#f7fbff]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.42em] text-slate-800">{workspaceName}</p>
            <p className="mt-1 text-xs text-slate-500">Inmobiliaria residencial en Veracruz</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <Link href="/" className="transition hover:text-slate-950">Inicio</Link>
            <Link href="/properties" className="transition hover:text-slate-950">Propiedades</Link>
            <a href="#agents" className="transition hover:text-slate-950">Agentes</a>
            <a href="#contact" className="transition hover:text-slate-950">Contacto</a>
          </nav>
          <Link href="/properties" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
            Ver propiedades
          </Link>
        </div>
      </header>

      <section className="px-6 pb-18 pt-6 lg:px-8 lg:pb-24 lg:pt-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
          <div className="pb-6 lg:pb-12">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Propiedades destacadas en Veracruz</p>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.94] tracking-tight text-slate-950 sm:text-7xl lg:text-[5.9rem]">
              Espacios frente al mar,
              <br />
              ciudad y tranquilidad.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-9 text-slate-600">
              Descubre propiedades con ubicación estratégica, diseño bien resuelto y el respaldo de una atención inmobiliaria cercana.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/properties" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                Ver propiedades
              </Link>
              <a href="#contact" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                Contactar por WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative min-h-[36rem] overflow-hidden rounded-[2.6rem] bg-gradient-to-br from-sky-100 to-white lg:min-h-[44rem]">
              {heroProperty?.coverImageUrl ? <Image src={heroProperty.coverImageUrl} alt={heroProperty.title} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/22 via-slate-950/5 to-transparent" />
            </div>
            {heroProperty ? (
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 rounded-[1.8rem] bg-white/90 px-5 py-4 backdrop-blur-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Propiedad destacada</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{heroProperty.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{heroProperty.locationLabel}</p>
                </div>
                <Link href={buildWorkspacePropertyPath(workspaceSlug, heroProperty.slug)} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                  Ver propiedad
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl lg:-mt-6 lg:px-10">
          <PublicLuxuryFilters basePath="/properties" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Propiedades destacadas</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Opciones bien ubicadas, con presencia y valor residencial.</h2>
          </div>
          <Link href="/properties" className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 transition hover:bg-slate-50 md:inline-flex">
            Ver más propiedades
          </Link>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {home.featuredProperties.slice(0, 3).map((property) => {
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article key={property.id} className="group space-y-5">
                <div className="relative h-[25rem] overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-sky-100 to-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /> : null}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.26em] text-slate-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Disponible"}</span>
                    <span>{property.publicCode ?? "Disponible"}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-950">{property.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                  <p className="text-lg font-medium text-slate-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                  {specsInline ? <p className="text-sm text-slate-500">{specsInline}</p> : null}
                  <Link href={buildWorkspacePropertyPath(workspaceSlug, property.slug)} className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                    Ver propiedad
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Selección reciente</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Más opciones para vivir o invertir en Veracruz.</h2>
          </div>
          <Link href="/properties" className="hidden text-sm text-slate-600 transition hover:text-slate-950 md:inline-flex">Ver todo</Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 lg:grid-cols-3">
          {home.recentProperties.slice(0, 3).map((property) => {
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article key={property.id} className="group space-y-5">
                <div className="relative h-80 overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-sky-100 to-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /> : null}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Disponible"}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">{property.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                  <p className="mt-4 text-base font-medium text-slate-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                  {specsInline ? <p className="mt-3 text-sm text-slate-500">{specsInline}</p> : null}
                  <Link href={buildWorkspacePropertyPath(workspaceSlug, property.slug)} className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                    Ver propiedad
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="agents" className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Asesoría inmobiliaria</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Acompañamiento cercano para elegir mejor.</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Una propiedad clara, asesoría visible y un siguiente paso simple para resolver dudas, comparar opciones o coordinar visita.
            </p>
            <div id="contact" className="mt-8 flex flex-wrap gap-3">
              <a href="https://wa.me/?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20sus%20propiedades." target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                Contactar por WhatsApp
              </a>
            </div>
          </div>

          {featuredAgent ? (
            <article className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div className="relative min-h-[26rem] overflow-hidden rounded-[2.2rem] bg-sky-50 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                {featuredAgent.avatarUrl ? <Image src={featuredAgent.avatarUrl} alt={featuredAgent.displayName} fill className="object-cover" unoptimized /> : null}
              </div>
              <div className="py-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Asesor destacado</p>
                <h3 className="mt-4 text-4xl font-semibold text-slate-950">{featuredAgent.displayName}</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.25em] text-slate-500">{featuredAgent.title ?? "Asesor inmobiliario"}</p>
                <p className="mt-6 text-sm leading-8 text-slate-600">{featuredAgent.bio ?? "Acompaña la búsqueda y ayuda a encontrar una propiedad acorde con ubicación, estilo de vida y presupuesto."}</p>
              </div>
            </article>
          ) : (
            <div className="text-sm text-slate-600">Todavía no hay asesores públicos visibles en este momento.</div>
          )}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        <div className="space-y-8 border-t border-black/6 pt-8">
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <Link href="/">Inicio</Link>
            <Link href="/properties">Propiedades</Link>
            <a href="#agents">Agentes</a>
            <a href="#contact">Contacto</a>
          </div>
          <PublicLegalDisclaimer />
        </div>
      </footer>
    </main>
  );
}
