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

function formatOperationLabel(operationType: string) {
  if (operationType === "sale") return "Venta";
  if (operationType === "rent") return "Renta";
  return "Disponible";
}

function formatPriceLabel(currencyCode: string, priceAmount: number | null) {
  return priceAmount ? `${currencyCode} ${priceAmount.toLocaleString("es-MX")}` : "Consultar";
}

function formatPropertyTypeLabel(propertyType: string | null | undefined) {
  if (propertyType === "house") return "Casa";
  if (propertyType === "apartment") return "Departamento";
  if (propertyType === "land") return "Terreno";
  if (propertyType === "office") return "Oficina";
  if (propertyType === "commercial") return "Local comercial";
  return "Propiedad";
}

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
  const activeProperties = properties.filter((property) => property.status === "active");
  const saleProperties = properties.filter((property) => property.operationType === "sale").length;
  const rentProperties = properties.filter((property) => property.operationType === "rent").length;
  const highlightedProperties = properties.slice(0, 6);
  const latestProperties = properties.slice(0, 3);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff8ec_0%,#f7fbff_35%,#eef5fb_100%)] text-slate-950">
      <PublicBrandHeader brandName={workspace.brand_name ?? workspace.name} logoUrl={workspace.public_logo_url} homeHref={`/w/${workspaceSlug}`} propertiesHref={`/w/${workspaceSlug}/properties`} />

      <section className="px-6 pb-20 pt-8 lg:px-8 lg:pb-24 lg:pt-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div className="pb-4 lg:pb-10">
            {workspace.public_logo_url ? (
              <div className="mb-10 flex w-full justify-start">
                <Image src={workspace.public_logo_url} alt={workspace.brand_name ?? workspace.name} width={760} height={300} className="h-auto max-h-44 w-auto max-w-[min(100%,34rem)] object-contain drop-shadow-[0_18px_35px_rgba(15,23,42,0.16)] sm:max-h-56 sm:max-w-[38rem]" unoptimized priority />
              </div>
            ) : null}
            <p className="text-xs uppercase tracking-[0.38em] text-slate-500">Inmobiliaria</p>
            <h1 className="mt-7 max-w-5xl text-4xl font-semibold leading-[0.95] tracking-tight text-slate-950 sm:text-6xl sm:leading-[0.92] lg:text-[6.25rem]">
              {workspace.public_claim ?? "Encuentra tu próximo hogar en Veracruz"}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-slate-600">
              {workspace.public_bio ?? "Propiedades seleccionadas en las mejores zonas, con asesoría cercana y atención personalizada."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full bg-[#d7ab5b] px-6 py-3.5 text-sm font-medium text-white shadow-[0_16px_35px_rgba(215,171,91,0.32)] transition hover:bg-[#c99a46]">
                Ver propiedades
              </Link>
              {workspace.public_whatsapp || workspace.public_phone ? <a href={`https://wa.me/${(workspace.public_whatsapp ?? workspace.public_phone ?? "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Hablar con la inmobiliaria</a> : null}
              {heroProperty?.agent?.slug ? (
                <Link href={`/w/${workspaceSlug}/agents/${heroProperty.agent.slug}`} className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                  Conocer a un asesor
                </Link>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
              {workspace.public_phone ? <span>Tel. {workspace.public_phone}</span> : null}
              {workspace.public_email ? <span>{workspace.public_email}</span> : null}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Inventario activo</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{activeProperties.length}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">En venta</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{saleProperties}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">En renta</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{rentProperties}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 to-white shadow-[0_30px_90px_rgba(15,23,42,0.10)] sm:rounded-[2.8rem] lg:min-h-[50rem]">
              {(workspace.public_hero_url ?? heroProperty?.coverImageUrl) ? <Image src={workspace.public_hero_url ?? heroProperty?.coverImageUrl ?? ""} alt={heroProperty?.title ?? (workspace.brand_name ?? workspace.name)} fill className="object-cover object-center" unoptimized /> : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.14)_55%,rgba(15,23,42,0.48)_100%)]" />
            </div>
            {heroProperty ? (
              <div className="mt-4 rounded-[1.6rem] bg-white/92 px-5 py-5 backdrop-blur-md shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:absolute sm:bottom-8 sm:left-8 sm:right-8 sm:mt-0 sm:rounded-[2rem] sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Selección editorial</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{heroProperty.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{heroProperty.locationLabel}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{formatOperationLabel(heroProperty.operationType)}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{formatPropertyTypeLabel(heroProperty.propertyType)}</span>
                      {heroProperty.agent?.displayName ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Atiende {heroProperty.agent.displayName}</span> : null}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <p className="text-right text-2xl font-semibold tracking-tight text-slate-950">{formatPriceLabel(heroProperty.currencyCode, heroProperty.priceAmount)}</p>
                    <Link href={`/w/${workspaceSlug}/properties/${heroProperty.slug}`} className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                      Ver propiedad
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl lg:-mt-2 lg:px-10">
          <PublicLuxuryFilters basePath={`/w/${workspaceSlug}/properties`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Cómo trabajamos</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Acompañamiento claro desde la primera conversación</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              No solo publicamos propiedades. Te ayudamos a entender contexto, comparar opciones y hablar con la persona adecuada según la propiedad que te interesa.
            </p>
          </article>
          <div className="grid gap-4 sm:grid-cols-3">
            {latestProperties.map((property, index) => (
              <article key={property.id} className="rounded-[1.7rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{index === 0 ? "Nueva prioridad" : index === 1 ? "Buena oportunidad" : "Para seguir explorando"}</p>
                <p className="mt-3 text-lg font-semibold leading-tight text-slate-950">{property.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{property.locationLabel}</p>
                <p className="mt-4 text-sm font-medium text-slate-950">{formatPriceLabel(property.currencyCode, property.priceAmount)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-24">
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
          {highlightedProperties.map((property) => {
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
                    <span>{formatOperationLabel(property.operationType)}</span>
                    <span>{property.publicCode ?? "Disponible"}</span>
                  </div>
                  <h3 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-[2rem]">{property.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">{formatPriceLabel(property.currencyCode, property.priceAmount)}</p>
                  {specsInline ? <p className="text-sm text-slate-500">{specsInline}</p> : null}
                  {property.agent?.displayName ? (
                    <p className="text-sm text-slate-500">
                      Responsable comercial: <span className="font-medium text-slate-800">{property.agent.displayName}</span>
                    </p>
                  ) : null}
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
