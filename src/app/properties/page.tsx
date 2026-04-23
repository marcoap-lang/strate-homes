import { featuredProperties } from "@/lib/mock-data";

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Propiedades</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Inventario curado con enfoque comercial y visual premium.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-600">
            Esta primera iteración prepara la experiencia pública de propiedades con datos mock estructurados, lista para evolucionar hacia Supabase.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProperties.map((property) => (
            <article key={property.id} className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
              <div className="h-56 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100" />
              <div className="p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                  <span>{property.operationType === "sale" ? "Venta" : "Renta"}</span>
                  <span>{property.status}</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{property.title}</h2>
                <p className="mt-2 text-sm text-zinc-600">{property.location}</p>
                <p className="mt-5 text-lg font-medium text-zinc-950">
                  {property.currency} {property.price?.toLocaleString("es-MX")}
                </p>
                <a
                  href={`/properties/${property.slug}`}
                  className="mt-6 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Ver detalle
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
