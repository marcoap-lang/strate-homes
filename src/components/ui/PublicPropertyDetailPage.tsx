import Image from "next/image";
import Link from "next/link";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { PublicShareActions } from "@/components/ui/PublicShareActions";
import { buildPublicAgentUrl, buildPublicPropertyUrl } from "@/lib/public-links";
import type { PublicProperty } from "@/lib/public-properties";

function formatOperation(operationType: string) {
  if (operationType === "sale") return "En venta";
  if (operationType === "rent") return "En renta";
  return "Disponible";
}

export function PublicPropertyDetailPage({
  property,
  similarProperties,
  workspaceSlug,
}: {
  property: PublicProperty;
  similarProperties: PublicProperty[];
  workspaceSlug?: string | null;
}) {
  const gallery = property.images.slice(0, 7);
  const cover = gallery[0] ?? null;
  const storyImages = gallery.slice(1, 5);
  const propertyBasePath = workspaceSlug ? `/w/${workspaceSlug}/properties` : "/properties";
  const propertyUrl = buildPublicPropertyUrl(property.slug, workspaceSlug ?? null);
  const locationText = [property.locationLabel, property.city, property.state].filter(Boolean).join(" · ") || property.locationLabel;
  const priceLabel = `${property.currencyCode} ${property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}`;
  const specsInline = [
    property.bedrooms ? `${property.bedrooms} recámaras` : null,
    property.bathrooms ? `${property.bathrooms} baños` : null,
    property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hola, me interesa ${property.title}.\nUbicación: ${locationText}\nPrecio: ${priceLabel}\nMás información: ${propertyUrl}`)}`;

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 py-10 text-slate-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={workspaceSlug ? `/w/${workspaceSlug}` : "/"} className="transition hover:text-slate-900">Inicio</Link>
          <span>•</span>
          <Link href={propertyBasePath} className="transition hover:text-slate-900">Propiedades</Link>
          <span>•</span>
          <span className="text-slate-900">{property.title}</span>
        </nav>

        <section className="overflow-hidden rounded-[2.6rem] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="relative min-h-[38rem] lg:min-h-[48rem]">
            {cover?.url ? <Image src={cover.url} alt={cover.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/38 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-8 pb-10 pt-28 text-white sm:px-10 lg:max-w-[52rem]">
              <span className="inline-flex rounded-full bg-[#d7ab5b] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm">
                {formatOperation(property.operationType)}
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[5.2rem]">{property.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">{locationText}</p>
              <p className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{priceLabel}</p>
              {specsInline ? <p className="mt-5 text-base text-white/85">{specsInline}</p> : null}
              <div className="mt-8 flex flex-wrap gap-4">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-medium text-white shadow-[0_10px_30px_rgba(215,171,91,0.3)] transition hover:bg-[#c99a46]">
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {storyImages.length ? (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Galería</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Espacios que cuentan la historia de la propiedad</h2>
              </div>
              <Link href={propertyBasePath} className="hidden text-sm text-slate-600 transition hover:text-slate-950 md:inline-flex">Ver más propiedades</Link>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max gap-5 pr-4">
                {storyImages.map((image, index) => (
                  <div key={image.id} className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-50 ${index === 0 ? "h-[22rem] w-[34rem]" : "h-[22rem] w-[20rem]"}`}>
                    {image.url ? <Image src={image.url} alt={image.altText ?? property.title} fill className="object-cover object-center" unoptimized /> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sobre la propiedad</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Vive una propiedad con mejor ubicación, amplitud y proyección</h2>
            <p className="mt-6 text-base leading-9 text-slate-700">
              {property.description ?? "Una propiedad pensada para quien busca ubicación, amplitud y una vida más cómoda en una zona con buen valor residencial."}
            </p>
            {specsInline ? <p className="mt-8 text-lg text-slate-600">{specsInline}</p> : null}
          </div>

          <aside className="rounded-[2.2rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Asesor inmobiliario</p>
            {property.agent ? (
              <div className="mt-6 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-sky-50 text-3xl font-semibold text-slate-700">
                  {property.agent.displayName.slice(0, 1).toUpperCase()}
                </div>
                <p className="mt-6 text-3xl font-semibold text-slate-950">{property.agent.displayName}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Te acompaña para resolver dudas, revisar disponibilidad y ayudarte a encontrar la mejor opción de acuerdo con tu búsqueda.
                </p>
                <div className="mt-8 flex justify-center">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-[#d7ab5b]/40 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-[#fff8ec]">
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            ) : null}
          </aside>
        </section>

        {similarProperties.length ? (
          <section className="space-y-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Propiedades similares</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950">Más opciones que podrían interesarte</h2>
              </div>
              <Link href={propertyBasePath} className="text-sm text-slate-600 transition hover:text-slate-950">Ver más propiedades</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {similarProperties.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                  <div className="relative h-56 bg-gradient-to-br from-zinc-200 to-zinc-100">
                    {item.coverImageUrl ? <Image src={item.coverImageUrl} alt={item.title} fill className="object-cover" unoptimized /> : null}
                  </div>
                  <div className="p-5">
                    <span className="inline-flex rounded-full bg-[#d7ab5b] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white">{formatOperation(item.operationType)}</span>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.locationLabel}</p>
                    <p className="mt-4 text-lg font-medium text-slate-950">{item.currencyCode} {item.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                    <Link href={`${propertyBasePath}/${item.slug}`} className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Ver propiedad</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-[2rem] bg-white px-8 py-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-semibold text-slate-950">¿Te interesa esta propiedad?</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Contáctanos por WhatsApp y recibe más información sobre disponibilidad, ubicación y visita.</p>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#d7ab5b] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#c99a46]">Contactar por WhatsApp</a>
          </div>
        </section>

        <PublicShareActions propertyUrl={propertyUrl} whatsappUrl={whatsappUrl} />
        <PublicLegalDisclaimer />
      </div>
    </main>
  );
}
