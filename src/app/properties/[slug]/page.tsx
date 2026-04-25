import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { PublicShareActions } from "@/components/ui/PublicShareActions";
import { buildPublicAgentUrl, buildPublicPropertyUrl, buildWhatsAppPropertyMessage } from "@/lib/public-links";
import { getPublicProperties, getPublicPropertyBySlug } from "@/lib/public-properties";

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

  const allProperties = await getPublicProperties();
  const similarProperties = allProperties.filter((item) => item.slug !== property.slug).slice(0, 3);
  const gallery = property.images.slice(0, 5);
  const cover = gallery[0] ?? null;
  const secondaryImages = gallery.slice(1, 5);
  const propertyUrl = buildPublicPropertyUrl(property.slug, null);
  const locationText = [property.locationLabel, property.city, property.state].filter(Boolean).join(" · ") || property.locationLabel;
  const priceLabel = `${property.currencyCode} ${property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}`;
  const whatsappMessage = buildWhatsAppPropertyMessage({
    title: property.title,
    locationLabel: locationText,
    priceLabel,
    propertyUrl,
  });
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-6 py-10 text-zinc-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-zinc-900">Inicio</Link>
          <span>•</span>
          <Link href="/properties" className="transition hover:text-zinc-900">Propiedades</Link>
          <span>•</span>
          <span className="text-zinc-900">{property.title}</span>
          {property.agent ? (
            <>
              <span>•</span>
              <a href={buildPublicAgentUrl(property.agent.id)} className="transition hover:text-zinc-900">Agente</a>
            </>
          ) : null}
        </nav>

        <section className="overflow-hidden rounded-[3rem] border border-black/5 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.05)]">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative min-h-[28rem] bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100 lg:min-h-[42rem]">
              {cover?.url ? <Image src={cover.url} alt={cover.altText ?? property.title} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-white/85">
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">{formatOperation(property.operationType)}</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">{property.publicCode ?? "Disponible"}</span>
                </div>
                <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">{property.title}</h1>
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
                <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">{priceLabel}</p>
                <p className="mt-4 text-sm leading-8 text-zinc-600">
                  Una ficha editorial, luminosa y lista para circular por WhatsApp sin perder claridad comercial.
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
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryImages.map((image) => (
                <div key={image.id} className="relative h-56 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
                  {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover" unoptimized /> : null}
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Galería</p>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-950">Imagen grande, texto justo y decisión más simple.</h2>
              <p className="mt-5 text-sm leading-8 text-zinc-600">
                La experiencia busca que la propiedad respire: más fotografía, más claridad y menos ruido visual tipo software.
              </p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Descripción</p>
              <h2 className="mt-3 text-3xl font-semibold text-zinc-950">Qué hace atractiva esta propiedad</h2>
              <p className="mt-5 text-sm leading-8 text-zinc-700">{property.description ?? "Esta propiedad ya forma parte del inventario real publicado en Strate Homes."}</p>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Ficha rápida</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

            {similarProperties.length ? (
              <section className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Más opciones</p>
                    <h2 className="mt-3 text-3xl font-semibold text-zinc-950">Propiedades similares</h2>
                  </div>
                  <Link href="/properties" className="text-sm text-zinc-600 transition hover:text-zinc-950">Ver más propiedades</Link>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {similarProperties.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#fcfaf6]">
                      <div className="relative h-40 bg-gradient-to-br from-zinc-200 to-zinc-100">
                        {item.coverImageUrl ? <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" unoptimized /> : null}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-zinc-950">{item.title}</h3>
                        <p className="mt-2 text-sm text-zinc-600">{item.locationLabel}</p>
                        <Link href={`/properties/${item.slug}`} className="mt-4 inline-flex text-sm text-zinc-900 underline-offset-4 hover:underline">
                          Ver propiedad
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Compartir propiedad</p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">Lista para WhatsApp</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-600">
                Comparte esta ficha con un mensaje prellenado claro, comercial y con link público directo.
              </p>
              <PublicShareActions propertyUrl={propertyUrl} whatsappUrl={whatsappUrl} />
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

        <PublicLegalDisclaimer />
      </div>
    </main>
  );
}
