import Image from "next/image";
import Link from "next/link";
import { getPublicWorkspaceHome } from "@/lib/public-home";

export default async function Home() {
  const home = await getPublicWorkspaceHome();
  const workspaceName = home.workspace?.brandName ?? home.workspace?.name ?? "Azure Coast Realty";
  const heroProperty = home.featuredProperties[0] ?? home.recentProperties[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7f3ed] text-zinc-950">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f3ed]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-zinc-800">{workspaceName}</p>
            <p className="text-xs text-zinc-500">Private brokerage style public site</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            <a href="#featured" className="transition hover:text-zinc-950">Destacadas</a>
            <a href="#inventory" className="transition hover:text-zinc-950">Inventario</a>
            <a href="#team" className="transition hover:text-zinc-950">Agentes</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/properties" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50">
              Explorar inventario
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-18 pt-14 lg:px-8 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-[2.75rem] bg-white px-8 py-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)] sm:px-10 lg:px-12">
            <p className="inline-flex w-fit rounded-full border border-zinc-900/10 bg-[#faf7f2] px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-zinc-600">
              Sitio público de la inmobiliaria
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
              Propiedades con una presentación luminosa, editorial y lista para vender mejor.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-zinc-600">
              {workspaceName} conecta inventario real, agentes visibles y una experiencia pública premium para evaluar el producto con sensación de brokerage de alto nivel.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/properties" className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                Ver propiedades activas
              </Link>
              <a href="#team" className="rounded-full border border-zinc-900/10 bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-900/20 hover:bg-zinc-50">
                Conocer agentes
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2.75rem] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <div className="relative min-h-[28rem] bg-gradient-to-br from-zinc-200 to-zinc-100 lg:min-h-[34rem]">
              {heroProperty?.coverImageUrl ? (
                <Image src={heroProperty.coverImageUrl} alt={heroProperty.title} fill className="object-cover" unoptimized />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
              {heroProperty ? (
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/75">Propiedad destacada</p>
                  <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{heroProperty.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">{heroProperty.locationLabel}</p>
                  <p className="mt-5 text-xl font-medium">
                    {heroProperty.currencyCode} {heroProperty.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Selección destacada</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Un frente visual más potente para las propiedades clave.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-zinc-600">
            Una selección editorial para probar portada, galerías, pricing y navegación general del producto con más realismo.
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {home.featuredProperties.slice(0, 3).map((property, index) => (
            <article key={property.id} className={`overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm ${index === 0 ? "lg:row-span-2" : ""}`}>
              <div className={`relative bg-gradient-to-br from-zinc-200 to-zinc-100 ${index === 0 ? "h-[28rem]" : "h-60"}`}>
                {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
                  <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                  <span>{property.publicCode ?? "Activa"}</span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-zinc-950">{property.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{property.locationLabel}</p>
                <p className="mt-5 text-base font-medium text-zinc-950">
                  {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                </p>
                <Link href={`/properties/${property.slug}`} className="mt-5 inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50">
                  Ver propiedad
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="inventory" className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-[2.5rem] bg-white px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.05)] sm:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Inventario activo</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Propiedades recientes con lectura comercial clara.
              </h2>
            </div>
            <Link href="/properties" className="text-sm font-medium text-zinc-700 underline-offset-4 transition hover:text-zinc-950 hover:underline">
              Ver todo el inventario
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {home.recentProperties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#fcfaf6] shadow-sm">
                <div className="relative h-56 bg-gradient-to-br from-zinc-200 to-zinc-100">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                    <span>{property.status}</span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-zinc-950">{property.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{property.locationLabel}</p>
                  <p className="mt-4 text-base font-medium text-zinc-950">
                    {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                  </p>
                  <Link href={`/properties/${property.slug}`} className="mt-5 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800">
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="mx-auto max-w-7xl px-6 py-8 pb-24 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Agentes destacados</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Caras visibles para una experiencia más creíble y cercana.
            </h2>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
            Atención comercial visible dentro del sitio público
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {home.featuredAgents.length ? (
            home.featuredAgents.map((agent) => (
              <article key={agent.id} className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-zinc-100">
                  {agent.avatarUrl ? <Image src={agent.avatarUrl} alt={agent.displayName} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="mt-5">
                  <h3 className="text-2xl font-semibold text-zinc-950">{agent.displayName}</h3>
                  <p className="mt-2 text-sm uppercase tracking-[0.25em] text-zinc-500">{agent.title ?? "Asesor comercial"}</p>
                  <p className="mt-4 text-sm leading-8 text-zinc-600">{agent.bio ?? "Perfil comercial visible dentro del sitio público del workspace."}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white p-6 text-sm text-zinc-600 md:col-span-3">
              Todavía no hay agentes públicos visibles en este workspace.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
