import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProperties } from "@/lib/public-properties";

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

      <section className="px-6 pb-18 pt-6 lg:px-8 lg:pb-24 lg:pt-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
          <div className="pb-6 lg:pb-12">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">{workspace.brand_name ?? workspace.name}</p>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.94] tracking-tight text-slate-950 sm:text-7xl">
              {workspace.public_claim ?? "Propiedades bien elegidas, atención clara y presentación comercial cuidada."}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-9 text-slate-600">
              {workspace.public_bio ?? `Explora la selección pública de ${workspace.brand_name ?? workspace.name} y descubre propiedades con mejor presentación, contexto y acompañamiento comercial.`}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={`/w/${workspaceSlug}/properties`} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                Ver propiedades
              </Link>
              {workspace.public_whatsapp || workspace.public_phone ? <a href={`https://wa.me/${(workspace.public_whatsapp ?? workspace.public_phone ?? "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">Contactar por WhatsApp</a> : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
              {workspace.public_phone ? <span>Tel. {workspace.public_phone}</span> : null}
              {workspace.public_email ? <span>{workspace.public_email}</span> : null}
            </div>
          </div>

          <div className="relative">
            <div className="relative min-h-[36rem] overflow-hidden rounded-[2.6rem] bg-gradient-to-br from-sky-100 to-white lg:min-h-[44rem]">
              {(workspace.public_hero_url ?? heroProperty?.coverImageUrl) ? <Image src={workspace.public_hero_url ?? heroProperty?.coverImageUrl ?? ""} alt={heroProperty?.title ?? (workspace.brand_name ?? workspace.name)} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/22 via-slate-950/5 to-transparent" />
            </div>
            {heroProperty ? (
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 rounded-[1.8rem] bg-white/90 px-5 py-4 backdrop-blur-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Propiedad destacada</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{heroProperty.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{heroProperty.locationLabel}</p>
                </div>
                <Link href={`/w/${workspaceSlug}/properties/${heroProperty.slug}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
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

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Propiedades destacadas</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Opciones bien ubicadas, con presencia y valor residencial.</h2>
          </div>
          <Link href={`/w/${workspaceSlug}/properties`} className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 transition hover:bg-slate-50 md:inline-flex">
            Ver más propiedades
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {properties.slice(0, 6).map((property) => {
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
            ].filter(Boolean).join(" · ");

            return (
              <article key={property.id} className="group space-y-5">
                <div className="relative h-[24rem] overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-sky-100 via-white to-sky-50 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /> : null}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.26em] text-slate-500">
                    <span>{property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Disponible"}</span>
                    <span>{property.publicCode ?? "Disponible"}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-950">{property.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                  <p className="text-lg font-medium text-slate-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
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

      <footer className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
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
