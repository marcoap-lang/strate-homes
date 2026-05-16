import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBrandHeader } from "@/components/ui/PublicBrandHeader";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProperties, type PublicPropertyFilters } from "@/lib/public-properties";

export default async function WorkspacePropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase.from("workspaces").select("id, name, slug, brand_name, public_logo_url, public_claim").eq("slug", workspaceSlug).maybeSingle();
  if (!workspace) notFound();

  const q = await searchParams;
  const filters: PublicPropertyFilters = {
    workspaceSlug,
    operation: typeof q.operation === "string" ? q.operation : null,
    location: typeof q.location === "string" ? q.location : null,
    price: typeof q.price === "string" ? q.price : null,
    bedrooms: typeof q.bedrooms === "string" ? q.bedrooms : null,
  };

  const properties = await getPublicProperties(filters);

  return (
    <main className="min-h-screen bg-[#f4efe8] px-6 py-10 text-slate-950 lg:px-8">
      <PublicBrandHeader brandName={workspace.brand_name ?? workspace.name} logoUrl={workspace.public_logo_url} homeHref={`/w/${workspaceSlug}`} propertiesHref={`/w/${workspaceSlug}/properties`} />
      <div className="mx-auto max-w-7xl space-y-16">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-[#7c6b59]">
          <Link href={`/w/${workspaceSlug}`} className="transition hover:text-[#17120e]">Inicio</Link>
          <span>•</span>
          <span className="text-[#17120e]">Propiedades</span>
        </nav>

        <section className="grid gap-12 rounded-[2.8rem] bg-[#16110d] px-6 py-8 text-[#f4e7d6] shadow-[0_28px_90px_rgba(0,0,0,0.14)] lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:px-8 lg:py-10">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-[#c7aa84]">{workspace.brand_name ?? workspace.name}</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-[#fff8ef] sm:text-6xl sm:leading-[0.94] lg:text-[4.8rem]">{workspace.public_claim ?? "Encuentra propiedades seleccionadas en las mejores zonas."}</h1>
            <p className="mt-5 text-base leading-8 text-[#dbcab5]">
              Filtra por operación, ubicación, precio o recámaras y descubre opciones ideales para vivir, invertir o cambiar de estilo de vida.
            </p>
          </div>
          <div>
            <PublicLuxuryFilters compact basePath={`/w/${workspaceSlug}/properties`} current={{
              operation: filters.operation ?? undefined,
              location: filters.location ?? undefined,
              price: filters.price ?? undefined,
              bedrooms: filters.bedrooms ?? undefined,
            }} />
          </div>
        </section>

        <section className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {properties.length ? properties.map((property) => {
            const specsInline = [
              property.bedrooms ? `${property.bedrooms} recámaras` : null,
              property.bathrooms ? `${property.bathrooms} baños` : null,
              property.constructionAreaM2 ? `${property.constructionAreaM2} m²` : null,
            ].filter(Boolean).join(" · ");

            return (
              <article key={property.id} className="group overflow-hidden rounded-[2.4rem] border border-[#e4d8c8] bg-[#fbf6ef] shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
                <div className="relative h-[26rem] overflow-hidden bg-gradient-to-br from-[#f0e5d6] via-white to-[#efe7da]">
                  {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /> : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,13,10,0.04)_0%,rgba(17,13,10,0.14)_100%)]" />
                  <div className="absolute left-5 top-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em]">
                    <span className="rounded-full bg-[#17120e] px-3 py-1.5 text-[#f7e7c8] shadow-[0_10px_22px_rgba(23,18,14,0.18)]">
                      {property.operationType === "sale" ? "Venta" : property.operationType === "rent" ? "Renta" : "Disponible"}
                    </span>
                    {property.agent?.displayName ? (
                      <span className="rounded-full border border-white/18 bg-white/88 px-3 py-1.5 text-[#4f4135] backdrop-blur">
                        {property.agent.displayName}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3 p-6">
                  <h2 className="font-serif text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#17120e] sm:text-[2rem]">{property.title}</h2>
                  <p className="text-sm leading-7 text-[#625547]">{property.locationLabel}</p>
                  <p className="text-2xl font-semibold tracking-tight text-[#17120e]">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                  {specsInline ? <p className="text-sm text-[#756756]">{specsInline}</p> : null}
                  <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="inline-flex rounded-full bg-[#17120e] px-5 py-3 text-sm font-medium text-[#f8efe3] transition hover:bg-[#2b211b]">
                    Ver residencia
                  </Link>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-[2rem] border border-[#e4d8c8] bg-[#fbf6ef] px-6 py-8 text-sm text-[#625547] md:col-span-2 xl:col-span-3">No encontramos propiedades con esos filtros. Prueba otra combinación para seguir explorando opciones.</div>
          )}
        </section>

        <PublicLegalDisclaimer />
      </div>
    </main>
  );
}
