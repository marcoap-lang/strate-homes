import Image from "next/image";
import Link from "next/link";
import { getPublicProperties } from "@/lib/public-properties";

export default async function PropertiesPage() {
  const properties = await getPublicProperties();

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Propiedades</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Inventario real con presentación comercial clara.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-600">
            Strate Homes ya muestra propiedades reales publicadas desde el inventario del workspace, respetando su estatus y visibilidad pública actual.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.length ? (
            properties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
                <div className="relative h-56 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100">
                  {property.coverImageUrl ? (
                    <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized />
                  ) : null}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                    <span>{property.publicCode ?? "Disponible"}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold">{property.title}</h2>
                  <p className="mt-2 text-sm text-zinc-600">
                    {property.locationLabel}
                    {property.city ? ` · ${property.city}` : ""}
                    {property.state ? `, ${property.state}` : ""}
                  </p>
                  <p className="mt-5 text-lg font-medium text-zinc-950">
                    {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                  </p>
                  <Link
                    href={`/properties/${property.slug}`}
                    className="mt-6 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-black/10 bg-white/70 p-8 text-sm text-zinc-600 md:col-span-2 xl:col-span-3">
              Todavía no hay propiedades públicas activas. Publica una propiedad desde el admin para verla aquí.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
