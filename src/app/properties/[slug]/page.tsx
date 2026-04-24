import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicPropertyBySlug } from "@/lib/public-properties";

function formatOperation(operationType: string) {
  if (operationType === "sale") return "Venta";
  if (operationType === "rent") return "Renta";
  return "Venta / Renta";
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const gallery = property.images.slice(0, 5);
  const cover = gallery[0] ?? null;
  const secondaryImages = gallery.slice(1, 5);

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-black/5 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.05)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[24rem] bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100 lg:min-h-[34rem]">
              {cover?.url ? <Image src={cover.url} alt={cover.altText ?? property.title} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-white/85">
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">{formatOperation(property.operationType)}</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">{property.publicCode ?? "Disponible"}</span>
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{property.title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                  {property.locationLabel}
                  {property.neighborhood ? ` · ${property.neighborhood}` : ""}
                  {property.city ? ` · ${property.city}` : ""}
                  {property.state ? `, ${property.state}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#fcfaf6] p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Resumen comercial</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">
                  {property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}
                </p>
                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  Propiedad publicada desde inventario real con enfoque comercial claro y presentación premium para consulta inmediata.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Recámaras", property.bedrooms?.toString() ?? "—"],
                  ["Baños", property.bathrooms?.toString() ?? "—"],
                  ["Construcción", property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : "—"],
                  ["Código", property.publicCode ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{label}</p>
                    <p className="mt-3 text-xl font-semibold text-zinc-950">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {gallery.length > 1 ? (
          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryImages.map((image) => (
                <div key={image.id} className="relative h-52 overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm">
                  {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover" unoptimized /> : null}
                </div>
              ))}
            </div>
            <div className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Galería</p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">Una primera impresión más fuerte</h2>
              <p className="mt-4 text-sm leading-8 text-zinc-600">
                La galería ya usa fotos reales del inventario para reforzar mejor la percepción de valor y ayudar a una decisión más rápida.
              </p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Descripción</p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">Qué hace atractiva esta propiedad</h2>
              <p className="mt-4 text-sm leading-8 text-zinc-700">{property.description ?? "Esta propiedad ya forma parte del inventario real publicado en Strate Homes."}</p>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Ficha rápida</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["Ubicación", [property.locationLabel, property.city, property.state].filter(Boolean).join(" · ") || "—"],
                  ["Tipo de operación", formatOperation(property.operationType)],
                  ["Recámaras", property.bedrooms?.toString() ?? "—"],
                  ["Baños", property.bathrooms?.toString() ?? "—"],
                  ["Construcción", property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : "—"],
                  ["Código interno", property.publicCode ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.5rem] border border-black/5 bg-[#fcfaf6] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{label}</p>
                    <p className="mt-3 text-base font-medium text-zinc-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Contacto</p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">Solicita información de esta propiedad</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-600">
                Si esta propiedad encaja contigo, el siguiente paso es pedir más información, validar disponibilidad y coordinar atención comercial.
              </p>

              <div className="mt-6 space-y-3">
                <a href="#" className="flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
                  Contactar por WhatsApp
                </a>
                <a href="#" className="flex w-full items-center justify-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">
                  Solicitar más detalles
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Agente comercial</p>
              {property.agent ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-700">
                      {property.agent.displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-zinc-950">{property.agent.displayName}</p>
                      <p className="text-sm text-zinc-500">Asesor comercial asignado</p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-zinc-600">
                    Esta propiedad ya tiene un responsable comercial visible para hacer más clara la atención al público.
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  Esta propiedad todavía no muestra un agente comercial visible, pero ya forma parte del inventario real publicado.
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
