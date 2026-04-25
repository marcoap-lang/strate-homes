import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  const { data: workspace } = await supabase.from("workspaces").select("id, name, slug, brand_name").eq("slug", workspaceSlug).maybeSingle();
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
    <main className="min-h-screen bg-[#f7fbff] px-6 py-10 text-slate-950 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={`/w/${workspaceSlug}`} className="transition hover:text-slate-900">Inicio</Link>
          <span>•</span>
          <span className="text-slate-900">Propiedades</span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{workspace.brand_name ?? workspace.name}</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">Propiedades publicadas de este workspace.</h1>
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

        <section className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => {
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
                  <h2 className="text-2xl font-semibold text-slate-950">{property.title}</h2>
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
        </section>

        <PublicLegalDisclaimer />
      </div>
    </main>
  );
}
