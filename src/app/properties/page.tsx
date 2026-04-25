import Image from "next/image";
import Link from "next/link";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { getPublicProperties } from "@/lib/public-properties";

export default async function PropertiesPage() {
  const properties = await getPublicProperties();

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-900">Inicio</Link>
          <span>•</span>
          <span className="text-zinc-900">Propiedades</span>
        </nav>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Colección pública</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
              Una selección luminosa, abierta y lista para compartirse.
            </h1>
          </div>
          <Link href="/" className="text-sm text-zinc-600 transition hover:text-zinc-950">Volver al inicio</Link>
        </div>

        <div className="mt-12 space-y-8">
          {properties.length ? (
            properties.map((property) => (
              <article key={property.id} className="grid gap-0 overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.05)] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[22rem] bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100 lg:min-h-[28rem]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                    <span>{property.publicCode ?? "Disponible"}</span>
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold text-zinc-950 sm:text-4xl">{property.title}</h2>
                  <p className="mt-4 max-w-xl text-base leading-8 text-zinc-600">
                    {property.locationLabel}
                    {property.city ? ` · ${property.city}` : ""}
                    {property.state ? `, ${property.state}` : ""}
                  </p>
                  <p className="mt-6 text-lg font-medium text-zinc-950">
                    {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={`/properties/${property.slug}`} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                      Ver detalle
                    </Link>
                    <a href="https://wa.me/?text=Hola,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20propiedades." target="_blank" rel="noreferrer" className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                      Contacto
                    </a>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-black/10 bg-white/70 p-8 text-sm text-zinc-600">
              Todavía no hay propiedades públicas activas. Publica una propiedad desde el admin para verla aquí.
            </div>
          )}
        </div>

        <div className="mt-12">
          <PublicLegalDisclaimer />
        </div>
      </div>
    </main>
  );
}
