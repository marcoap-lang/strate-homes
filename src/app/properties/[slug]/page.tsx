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
    <main className="min-h-screen bg-[#f7fbff] px-6 py-10 text-slate-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-14 lg:space-y-20">
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

        <section className="grid gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-zinc-500">
                <span>{formatOperation(property.operationType)}</span>
                <span>•</span>
                <span>{property.publicCode ?? "Disponible"}</span>
              </div>
              <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                {property.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                {property.locationLabel}
                {property.neighborhood ? ` · ${property.neighborhood}` : ""}
                {property.city ? ` · ${property.city}` : ""}
                {property.state ? `, ${property.state}` : ""}
              </p>
            </div>

            <div className="relative min-h-[30rem] overflow-hidden rounded-[2.8rem] bg-gradient-to-br from-sky-100 via-white to-sky-50 lg:min-h-[44rem]">
              {cover?.url ? <Image src={cover.url} alt={cover.altText ?? property.title} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/0 to-transparent" />
            </div>
          </div>

          <aside className="space-y-8 lg:pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Precio</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{priceLabel}</p>
              <p className="mt-5 max-w-md text-sm leading-8 text-slate-600">
                Una ficha clara y elegante para conocer mejor la propiedad, compartirla y dar el siguiente paso con asesoría profesional.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["Recámaras", property.bedrooms?.toString() ?? "—"],
                ["Baños", property.bathrooms?.toString() ?? "—"],
                ["Construcción", property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : "—"],
                ["Ubicación", locationText || "—"],
              ].map(([label, value]) => (
                <div key={label} className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</p>
                  <p className="text-xl font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-black/6 pt-8">
              <PublicShareActions propertyUrl={propertyUrl} whatsappUrl={whatsappUrl} />
            </div>

            <div className="border-t border-black/6 pt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Asesor inmobiliario</p>
              {property.agent ? (
                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-700">
                    {property.agent.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-950">{property.agent.displayName}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Acompaña el proceso para resolver dudas, revisar disponibilidad y coordinar visita o atención comercial.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  Esta propiedad todavía no muestra un agente comercial visible, pero ya forma parte del inventario real publicado.
                </p>
              )}
            </div>
          </aside>
        </section>

        {gallery.length > 1 ? (
          <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="grid gap-5 sm:grid-cols-2">
              {secondaryImages.map((image) => (
                <div key={image.id} className="relative h-64 overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-200 to-zinc-100">
                  {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover" unoptimized /> : null}
                </div>
              ))}
            </div>
            <div className="max-w-lg py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Galería</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Más fotografía, mejor lectura de la propiedad.</h2>
              <p className="mt-5 text-sm leading-8 text-slate-600">
                La idea es que la propiedad se entienda desde la imagen, los espacios y la ubicación, con una experiencia limpia y profesional.
              </p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-14 lg:grid-cols-[1fr_0.88fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Descripción</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Qué hace especial esta propiedad</h2>
            <p className="mt-6 text-base leading-9 text-slate-700">
              {property.description ?? "Esta propiedad ya forma parte del inventario real publicado en Strate Homes."}
            </p>
          </div>

          {similarProperties.length ? (
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Más opciones</p>
                  <h2 className="mt-4 text-3xl font-semibold text-zinc-950">Propiedades similares</h2>
                </div>
                <Link href="/properties" className="text-sm text-zinc-600 transition hover:text-zinc-950">Ver más propiedades</Link>
              </div>
              <div className="mt-6 space-y-6">
                {similarProperties.map((item) => (
                  <article key={item.id} className="grid gap-4 sm:grid-cols-[0.42fr_0.58fr] sm:items-center">
                    <div className="relative h-40 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-zinc-200 to-zinc-100">
                      {item.coverImageUrl ? <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" unoptimized /> : null}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-zinc-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-zinc-600">{item.locationLabel}</p>
                      <Link href={`/properties/${item.slug}`} className="mt-4 inline-flex text-sm text-zinc-900 underline-offset-4 hover:underline">
                        Ver propiedad
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <PublicLegalDisclaimer />
      </div>
    </main>
  );
}
