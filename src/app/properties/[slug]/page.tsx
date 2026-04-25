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
  const gallery = property.images.slice(0, 6);
  const cover = gallery[0] ?? null;
  const secondaryImages = gallery.slice(1, 3);
  const remainingImages = gallery.slice(3, 6);
  const propertyUrl = buildPublicPropertyUrl(property.slug, null);
  const locationText = [property.locationLabel, property.city, property.state].filter(Boolean).join(" · ") || property.locationLabel;
  const priceLabel = `${property.currencyCode} ${property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}`;
  const specsInline = [
    property.bedrooms ? `${property.bedrooms} recámaras` : null,
    property.bathrooms ? `${property.bathrooms} baños` : null,
    property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const whatsappMessage = buildWhatsAppPropertyMessage({
    title: property.title,
    locationLabel: locationText,
    priceLabel,
    propertyUrl,
  });
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 py-10 text-slate-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16 lg:space-y-24">
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

        <section className="grid gap-10 lg:grid-cols-[1.16fr_0.84fr] lg:items-end">
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-zinc-500">
                <span>{formatOperation(property.operationType)}</span>
                <span>•</span>
                <span>{property.publicCode ?? "Disponible"}</span>
              </div>
              <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">{property.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{locationText}</p>
            </div>

            <div className="relative min-h-[34rem] overflow-hidden rounded-[3rem] bg-gradient-to-br from-sky-100 via-white to-sky-50 lg:min-h-[50rem]">
              {cover?.url ? <Image src={cover.url} alt={cover.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                <h2 className="text-2xl font-semibold sm:text-3xl">{property.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">{locationText}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-10 lg:pb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Precio</p>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">{priceLabel}</p>
              {specsInline ? <p className="mt-5 text-sm leading-7 text-slate-500">{specsInline}</p> : null}
              <p className="mt-5 max-w-md text-sm leading-8 text-slate-600">
                Una ficha clara y elegante para conocer mejor la propiedad, compartirla y dar el siguiente paso con asesoría profesional.
              </p>
            </div>

            <div>
              <PublicShareActions propertyUrl={propertyUrl} whatsappUrl={whatsappUrl} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Asesor inmobiliario</p>
              {property.agent ? (
                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-xl font-semibold text-slate-700">
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
          <section className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
              <div className="relative h-[28rem] overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-zinc-200 to-zinc-100 lg:h-[34rem]">
                {secondaryImages[0]?.url ? <Image src={secondaryImages[0].url} alt={secondaryImages[0].altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
              </div>
              <div className="grid gap-6">
                {secondaryImages.slice(1).map((image) => (
                  <div key={image.id} className="relative h-[13.25rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-200 to-zinc-100 lg:h-[16.2rem]">
                    {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
                  </div>
                ))}
              </div>
            </div>

            {remainingImages.length ? (
              <div className="grid gap-6 md:grid-cols-3">
                {remainingImages.map((image) => (
                  <div key={image.id} className="relative h-56 overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-200 to-zinc-100">
                    {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="grid gap-16 lg:grid-cols-[1fr_0.88fr] lg:items-start">
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
