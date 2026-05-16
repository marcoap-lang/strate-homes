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
    <main className="min-h-screen bg-[#f4efe8] px-6 pb-28 pt-10 text-slate-950 md:pb-10 lg:px-8">
      <PublicBrandHeader
        brandName={tour.workspace.brandName ?? tour.workspace.name}
        logoUrl={tour.workspace.logoUrl}
        homeHref={`/w/${workspaceSlug}`}
        propertiesHref={`/w/${workspaceSlug}/properties`}
      />

      <div className="mx-auto max-w-7xl space-y-14 pt-10">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-[#7c6b59]">
          <Link href={`/w/${workspaceSlug}`} className="transition hover:text-[#17120e]">Inicio</Link>
          <span>•</span>
          <Link href={`/w/${workspaceSlug}/properties`} className="transition hover:text-[#17120e]">Propiedades</Link>
          <span>•</span>
          <span className="text-[#17120e]">Recorrido</span>
        </nav>

        <section className="overflow-hidden rounded-[2.8rem] bg-[#16110d] text-white shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c7aa84]">Recorrido curado</p>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#fff8ef] sm:text-6xl">{tour.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#dbcab5]">
                {tour.introMessage ?? "Una selección guiada para comparar opciones, entender diferencias clave y avanzar con más claridad antes de agendar visitas."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#eadbc8]">
                <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2">{tour.properties.length} propiedades</span>
                <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2">Vista comparativa</span>
                <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2">Link compartible</span>
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
            <p className="text-xs uppercase tracking-[0.28em] text-[#8a6a43]">Itinerario de propiedades</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.04em] text-[#17120e] sm:text-4xl">Revisa cada opción en orden</h2>
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
                <article key={property.id} className="grid overflow-hidden rounded-[2.2rem] border border-[#e4d8c8] bg-[#fbf6ef] shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:grid-cols-[0.45fr_0.55fr]">
                  <div className="relative min-h-72 bg-[#eee4d7]">
                    {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover" unoptimized /> : null}
                    <span className="absolute left-4 top-4 rounded-full bg-[#17120e] px-4 py-2 text-xs font-semibold text-[#f7e7c8] shadow-[0_10px_22px_rgba(23,18,14,0.18)]">Parada {index + 1}</span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#7b6856]">
                      <span>{formatOperation(property.operationType)}</span>
                      {property.publicCode ? <span>· {property.publicCode}</span> : null}
                    </div>
                    <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#17120e]">{property.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#625547]">{property.locationLabel}</p>
                    <p className="mt-5 text-2xl font-semibold text-[#17120e]">{priceLabel}</p>
                    {specsInline ? <p className="mt-3 text-sm text-[#756756]">{specsInline}</p> : null}
                    <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#625547]">{property.description ?? "Propiedad seleccionada para este recorrido."}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="rounded-full bg-[#17120e] px-5 py-3 text-center text-sm font-medium text-[#f8efe3] transition hover:bg-[#2b211b]">Ver residencia</Link>
                      {number ? <a href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#d8c3a1] bg-[#fffaf3] px-5 py-3 text-center text-sm font-medium text-[#2f251c] transition hover:border-[#cda66d] hover:bg-[#fbf1e2]">Preguntar por esta</a> : null}
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
