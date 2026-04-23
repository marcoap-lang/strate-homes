import { featuredProperties } from "@/lib/mock-data";
import { notFound } from "next/navigation";

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = featuredProperties.find((item) => item.slug === slug);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <section>
            <div className="rounded-[2rem] bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100 p-4">
              <div className="h-[28rem] rounded-[1.5rem] bg-white/45 backdrop-blur-sm" />
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">{property.title}</h1>
            <p className="mt-3 text-lg text-zinc-600">{property.locationLabel}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-600">
              <span className="rounded-full border border-black/10 bg-white px-4 py-2">{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Venta / Renta"}</span>
              <span className="rounded-full border border-black/10 bg-white px-4 py-2">{property.status}</span>
              <span className="rounded-full border border-black/10 bg-white px-4 py-2">
                {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX")}
              </span>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Recámaras", property.bedrooms?.toString() ?? "—"],
                ["Baños", property.bathrooms?.toString() ?? "—"],
                ["Construcción", property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-black/5 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{label}</p>
                  <p className="mt-2 text-xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Acciones</p>
              <h2 className="mt-3 text-2xl font-semibold">Solicitar información</h2>
            </div>
            <p className="text-sm leading-7 text-zinc-600">
              Este panel se conecta después con leads, WhatsApp y asignación de agente. Por ahora deja lista la narrativa comercial.
            </p>
            <a href="#" className="inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
              Contactar por WhatsApp
            </a>
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[#f8f5ef] p-5">
              <p className="text-sm font-medium text-zinc-700">Próxima mejora</p>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                Agregar galería real, mapa, fichas técnicas, propiedades relacionadas y formulario conectado a CRM.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
