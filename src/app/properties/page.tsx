import Image from "next/image";
import Link from "next/link";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { getPublicProperties, type PublicPropertyFilters } from "@/lib/public-properties";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: PublicPropertyFilters = {
    operation: typeof params.operation === "string" ? params.operation : null,
    location: typeof params.location === "string" ? params.location : null,
    type: typeof params.type === "string" ? params.type : null,
    price: typeof params.price === "string" ? params.price : null,
    bedrooms: typeof params.bedrooms === "string" ? params.bedrooms : null,
  };

  const properties = await getPublicProperties(filters);

  return (
    <main className="min-h-screen bg-[#fbf8f3] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-900">Inicio</Link>
          <span>•</span>
          <span className="text-zinc-900">Propiedades</span>
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Colección pública</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">Una selección curada y lista para convertirse en visita.</h1>
            <p className="mt-5 text-base leading-8 text-zinc-600">
              Filtra por operación, ubicación, tipo, precio o recámaras y descubre propiedades reales con presentación clara y premium.
            </p>
          </div>
          <div>
            <PublicLuxuryFilters compact current={{
              operation: filters.operation ?? undefined,
              location: filters.location ?? undefined,
              type: filters.type ?? undefined,
              price: filters.price ?? undefined,
              bedrooms: filters.bedrooms ?? undefined,
            }} />
          </div>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {properties.length ? (
            properties.map((property) => (
              <article key={property.id} className="space-y-5">
                <div className="relative h-[24rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.26em] text-zinc-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
                    <span>{property.propertyType === "house" ? "Casa" : property.propertyType === "apartment" ? "Depto" : property.propertyType === "office" ? "Oficina" : property.propertyType ?? "Propiedad"}</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-zinc-950">{property.title}</h2>
                  <p className="text-sm leading-7 text-zinc-600">{property.locationLabel}</p>
                  <p className="text-lg font-medium text-zinc-950">
                    {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span>{property.bedrooms ?? "—"} rec</span>
                    <span>{property.bathrooms ?? "—"} baños</span>
                  </div>
                  <Link href={`/properties/${property.slug}`} className="inline-flex rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50">
                    Ver propiedad
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="text-sm text-zinc-600 md:col-span-2 xl:col-span-3">No encontramos propiedades con esos filtros. Prueba otra combinación.</div>
          )}
        </div>

        <div className="mt-16">
          <PublicLegalDisclaimer />
        </div>
      </div>
    </main>
  );
}
