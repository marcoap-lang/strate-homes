import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { PublicShareActions } from "@/components/ui/PublicShareActions";
import { buildPublicPropertyUrl, buildWhatsAppPropertyMessage } from "@/lib/public-links";
import { getPublicPropertyTour } from "@/lib/public-tours";

function formatOperation(operationType: string) {
  if (operationType === "sale") return "Venta";
  if (operationType === "rent") return "Renta";
  return "Disponible";
}

export default async function WorkspacePropertyTourPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; tourSlug: string }>;
}) {
  const { workspaceSlug, tourSlug } = await params;
  const tour = await getPublicPropertyTour(workspaceSlug, tourSlug);

  if (!tour) notFound();

  const firstProperty = tour.properties[0] ?? null;
  const whatsappTarget = firstProperty?.agent?.whatsapp ?? firstProperty?.agent?.phone ?? firstProperty?.workspaceContactAgent?.whatsapp ?? firstProperty?.workspaceContactAgent?.phone ?? "";
  const whatsappNumber = whatsappTarget.replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola, me interesa revisar este recorrido de propiedades: ${tour.title}.\n${tour.shareUrl}`,
      )}`
    : undefined;

  return (
    <main className="min-h-screen bg-[#f7fbff] px-6 pb-28 pt-10 text-slate-950 md:pb-10 lg:px-8">
      <PublicBrandHeader
        brandName={tour.workspace.brandName ?? tour.workspace.name}
        logoUrl={tour.workspace.logoUrl}
        homeHref={`/w/${workspaceSlug}`}
        propertiesHref={`/w/${workspaceSlug}/properties`}
      />

      <div className="mx-auto max-w-7xl space-y-14 pt-10">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={`/w/${workspaceSlug}`} className="transition hover:text-slate-900">Inicio</Link>
          <span>•</span>
          <Link href={`/w/${workspaceSlug}/properties`} className="transition hover:text-slate-900">Propiedades</Link>
          <span>•</span>
          <span className="text-slate-900">Recorrido</span>
        </nav>

        <section className="overflow-hidden rounded-[2.6rem] bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Recorrido curado</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{tour.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
                {tour.introMessage ?? "Una selección guiada para comparar opciones, entender diferencias clave y avanzar con más claridad antes de agendar visitas."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">{tour.properties.length} propiedades</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">Vista comparativa</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">Link compartible</span>
              </div>
            </div>
            <div className="relative min-h-[24rem] bg-slate-900 lg:min-h-[34rem]">
              {firstProperty?.coverImageUrl ? <Image src={firstProperty.coverImageUrl} alt={firstProperty.title} fill className="object-cover opacity-80" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Itinerario de propiedades</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Revisa cada opción en orden</h2>
          </div>

          <div className="grid gap-5">
            {tour.properties.map((property, index) => {
              const propertyUrl = buildPublicPropertyUrl(property.slug, workspaceSlug);
              const priceLabel = `${property.currencyCode} ${property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}`;
              const specsInline = [
                property.bedrooms ? `${property.bedrooms} recámaras` : null,
                property.bathrooms ? `${property.bathrooms} baños` : null,
                property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
              ].filter(Boolean).join(" · ");
              const message = buildWhatsAppPropertyMessage({ title: property.title, locationLabel: property.locationLabel, priceLabel, propertyUrl });
              const number = (property.agent?.whatsapp ?? property.agent?.phone ?? property.workspaceContactAgent?.whatsapp ?? property.workspaceContactAgent?.phone ?? "").replace(/\D/g, "");

              return (
                <article key={property.id} className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:grid-cols-[0.45fr_0.55fr]">
                  <div className="relative min-h-72 bg-slate-100">
                    {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                    <span className="absolute left-4 top-4 rounded-full bg-white/92 px-4 py-2 text-xs font-semibold text-slate-950 backdrop-blur">Parada {index + 1}</span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <span>{formatOperation(property.operationType)}</span>
                      {property.publicCode ? <span>· {property.publicCode}</span> : null}
                    </div>
                    <h3 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">{property.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                    <p className="mt-5 text-2xl font-semibold text-slate-950">{priceLabel}</p>
                    {specsInline ? <p className="mt-3 text-sm text-slate-500">{specsInline}</p> : null}
                    <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600">{property.description ?? "Propiedad seleccionada para este recorrido."}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="rounded-full bg-[#d7ab5b] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-[#c99a46]">Ver ficha completa</Link>
                      {number ? <a href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-50">Preguntar por esta</a> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <PublicShareActions propertyUrl={tour.shareUrl} whatsappUrl={whatsappUrl} />
        <PublicLegalDisclaimer />
      </div>
      <PublicShareActions propertyUrl={tour.shareUrl} whatsappUrl={whatsappUrl} sticky />
    </main>
  );
}
