import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProperties } from "@/lib/public-properties";
import { buildSeoMetadata, compactDescription } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ workspaceSlug: string }> }): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, brand_name, public_claim, public_bio, public_logo_url, public_hero_url")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) return {};

  const brandName = workspace.brand_name ?? workspace.name;

  return buildSeoMetadata({
    title: `${brandName} | Propiedades inmobiliarias`,
    description: compactDescription(workspace.public_bio, workspace.public_claim ?? `Propiedades publicadas por ${brandName}.`),
    path: `/w/${workspaceSlug}`,
    image: workspace.public_hero_url ?? workspace.public_logo_url,
  });
}

export default async function WorkspacePublicHome({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, brand_name, public_phone, public_whatsapp, public_email, public_claim, public_bio, public_logo_url, public_hero_url")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) notFound();

  const properties = await getPublicProperties({ workspaceSlug });
  const heroProperty = properties[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-950">
      <PublicBrandHeader brandName={workspace.brand_name ?? workspace.name} logoUrl={workspace.public_logo_url} homeHref={`/w/${workspaceSlug}`} propertiesHref={`/w/${workspaceSlug}/properties`} />

      <section className="px-6 pb-24 pt-8 lg:px-8 lg:pb-32 lg:pt-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="pb-8 lg:pb-14">
            {workspace.public_logo_url ? (
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:h-28 sm:w-28">
                <Image src={workspace.public_logo_url} alt={workspace.brand_name ?? workspace.name} width={160} height={160} className="max-h-full max-w-full object-contain" unoptimized />
              </div>
            ) : null}
            <p className="text-xs uppercase tracking-[0.38em] text-slate-500">{workspace.brand_name ?? workspace.name}</p>
            <h1 className="mt-7 max-w-5xl text-4xl font-semibold leading-[0.95] tracking-tight text-slate-950 sm:text-6xl sm:leading-[0.92] lg:text-[6.25rem]">
              {workspace.public_claim ?? "Encuentra tu próximo hogar en Veracruz"}
            </h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-slate-600">
              {workspace.public_bio ?? "Propiedades seleccionadas en las mejores zonas, con asesoría cercana y atención personalizada."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                Ver propiedades
              </Link>
              {workspace.public_whatsapp || workspace.public_phone ? <a href={`https://wa.me/${(workspace.public_whatsapp ?? workspace.public_phone ?? "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Contactar a la inmobiliaria</a> : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
              {workspace.public_phone ? <span>Tel. {workspace.public_phone}</span> : null}
              {workspace.public_email ? <span>{workspace.public_email}</span> : null}
            </div>
          </div>

          <div className="relative">
            <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 to-white shadow-[0_30px_90px_rgba(15,23,42,0.10)] sm:rounded-[2.8rem] lg:min-h-[50rem]">
              {(workspace.public_hero_url ?? heroProperty?.coverImageUrl) ? <Image src={workspace.public_hero_url ?? heroProperty?.coverImageUrl ?? ""} alt={heroProperty?.title ?? (workspace.brand_name ?? workspace.name)} fill className="object-cover object-center" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-slate-950/8 to-transparent" />
            </div>
            {heroProperty ? (
              <div className="mt-4 flex flex-col gap-4 rounded-[1.6rem] bg-white/92 px-5 py-5 backdrop-blur-md shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:absolute sm:bottom-8 sm:left-8 sm:right-8 sm:mt-0 sm:flex-row sm:items-end sm:justify-between sm:rounded-[2rem] sm:px-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Propiedad destacada</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{heroProperty.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{heroProperty.locationLabel}</p>
                </div>
                <Link href={`/w/${workspaceSlug}/properties/${heroProperty.slug}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                  Ver propiedad
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl lg:-mt-6 lg:px-10">
          <PublicLuxuryFilters basePath={`/w/${workspaceSlug}/properties`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Propiedades destacadas</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Oportunidades seleccionadas para ti</h2>
          </div>
          <Link href={`/w/${workspaceSlug}/properties`} className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 transition hover:bg-slate-50 md:inline-flex">
            Ver más propiedades
          </Link>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {properties.slice(0, 6).map((property) => {
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
            ].filter(Boolean).join(" · ");

            return (
              <article key={property.id} className="group space-y-5">
                <div className="relative h-[26rem] overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-sky-100 via-white to-sky-50 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /> : null}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.26em] text-slate-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Disponible"}</span>
                    <span>{property.publicCode ?? "Disponible"}</span>
                  </div>
                  <h3 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-[2rem]">{property.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                  {specsInline ? <p className="text-sm text-slate-500">{specsInline}</p> : null}
                  <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                    Ver propiedad
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8">
        <div className="space-y-3 pb-8 text-sm text-slate-500">
          <p className="font-medium text-slate-900">{workspace.brand_name ?? workspace.name}</p>
          {workspace.public_phone ? <p>Teléfono: {workspace.public_phone}</p> : null}
          {workspace.public_whatsapp ? <p>WhatsApp: {workspace.public_whatsapp}</p> : null}
          {workspace.public_email ? <p>Email: {workspace.public_email}</p> : null}
        </div>
        <PublicLegalDisclaimer />
      </footer>
    </main>
  );
}
