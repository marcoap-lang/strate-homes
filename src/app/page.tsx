import Image from "next/image";
import Link from "next/link";
import { getPublicWorkspaceHome } from "@/lib/public-home";

export default async function Home() {
  const home = await getPublicWorkspaceHome();
  const workspaceName = home.workspace?.brandName ?? home.workspace?.name ?? "Tu inmobiliaria";

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-zinc-950">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f6f1e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-700">{workspaceName}</p>
            <p className="text-xs text-zinc-500">Sitio público inmobiliario</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            <a href="#featured" className="transition hover:text-zinc-950">Destacadas</a>
            <a href="#inventory" className="transition hover:text-zinc-950">Inventario</a>
            <a href="#team" className="transition hover:text-zinc-950">Equipo</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/properties" className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-black/5">
              Ver propiedades
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-8 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-zinc-900/10 bg-white px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-zinc-600 shadow-sm">
              Presencia pública del workspace
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
              {workspaceName} muestra su inventario real con una experiencia clara, comercial y premium.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              Explora propiedades activas, descubre el inventario destacado y conecta con el equipo comercial desde una web pública alimentada por datos reales del sistema.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/properties" className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                Ver inventario
              </Link>
              <a href="#team" className="rounded-full border border-zinc-900/10 bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:border-zinc-900/20 hover:bg-zinc-50">
                Conocer equipo
              </a>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/60 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
            <div className="rounded-[1.5rem] bg-zinc-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Resumen del sitio público</p>
              <div className="mt-6 space-y-4">
                {[
                  ["Propiedades activas", `${home.recentProperties.length}`],
                  ["Destacadas visibles", `${home.featuredProperties.length}`],
                  ["Agentes visibles", `${home.featuredAgents.length}`],
                  ["Experiencia", "Inventario real"],
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

      <section id="featured" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Propiedades destacadas</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Inventario que merece una primera mirada.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-zinc-600">
            Propiedades activas seleccionadas desde el inventario real del workspace para mostrar valor comercial desde la portada.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {home.featuredProperties.length ? (
            home.featuredProperties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm">
                <div className="relative h-48 bg-gradient-to-br from-zinc-200 to-zinc-100">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                    <span>{property.publicCode ?? "Activa"}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-zinc-950">{property.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{property.locationLabel}</p>
                  <p className="mt-4 text-base font-medium text-zinc-950">
                    {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                  </p>
                  <Link href={`/properties/${property.slug}`} className="mt-5 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800">
                    Ver propiedad
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white p-6 text-sm text-zinc-600 md:col-span-3">
              Todavía no hay propiedades destacadas visibles en esta home pública.
            </div>
          )}
        </div>
      </section>

      <section id="inventory" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Inventario activo</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Propiedades recientes y listas para consulta.
            </h2>
          </div>
          <Link href="/properties" className="text-sm font-medium text-zinc-700 underline-offset-4 transition hover:text-zinc-950 hover:underline">
            Ver listado completo
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {home.recentProperties.map((property) => (
            <article key={property.id} className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
                <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                <span>{property.status}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-zinc-950">{property.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{property.locationLabel}</p>
              <p className="mt-4 text-base font-medium text-zinc-950">
                {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
              </p>
              <Link href={`/properties/${property.slug}`} className="mt-5 inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50">
                Ver detalle
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="team" className="mx-auto max-w-7xl px-6 py-8 pb-20 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Equipo comercial</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Agentes visibles del workspace.
            </h2>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
            CTA natural: pedir información del inventario activo
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {home.featuredAgents.length ? (
            home.featuredAgents.map((agent) => (
              <article key={agent.id} className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100">
                    {agent.avatarUrl ? <Image src={agent.avatarUrl} alt={agent.displayName} fill className="object-cover" unoptimized /> : null}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-950">{agent.displayName}</h3>
                    <p className="text-sm text-zinc-500">{agent.title ?? "Asesor comercial"}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-600">{agent.bio ?? "Perfil comercial visible dentro del sitio público del workspace."}</p>
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
