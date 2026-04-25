import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLuxuryFilters } from "@/components/ui/PublicLuxuryFilters";
import { PublicLegalDisclaimer } from "@/components/ui/PublicLegalDisclaimer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicProperties } from "@/lib/public-properties";

export default async function WorkspacePublicHome({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, brand_name")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) notFound();

  const properties = await getPublicProperties({ workspaceSlug });
  const heroProperty = properties[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-950">
      <header className="sticky top-0 z-50 bg-[#f7fbff]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.42em] text-slate-800">{workspace.brand_name ?? workspace.name}</p>
            <p className="mt-1 text-xs text-slate-500">Sitio público del workspace</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <Link href={`/w/${workspaceSlug}`} className="transition hover:text-slate-950">Inicio</Link>
            <Link href={`/w/${workspaceSlug}/properties`} className="transition hover:text-slate-950">Propiedades</Link>
            <Link href="/login" className="transition hover:text-slate-950">Login</Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pb-18 pt-6 lg:px-8 lg:pb-24 lg:pt-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-end">
          <div className="pb-6 lg:pb-12">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">{workspace.brand_name ?? workspace.name}</p>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.94] tracking-tight text-slate-950 sm:text-7xl">
              Propiedades, ubicaciones y atención clara en un solo lugar.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-9 text-slate-600">
              Explora la selección pública del workspace y entra directamente a cada propiedad publicada.
            </p>
          </div>

          <div className="relative">
            <div className="relative min-h-[36rem] overflow-hidden rounded-[2.6rem] bg-gradient-to-br from-sky-100 to-white lg:min-h-[44rem]">
              {heroProperty?.coverImageUrl ? <Image src={heroProperty.coverImageUrl} alt={heroProperty.title} fill className="object-cover" unoptimized /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/22 via-slate-950/5 to-transparent" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl lg:-mt-6 lg:px-10">
          <PublicLuxuryFilters basePath={`/w/${workspaceSlug}/properties`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-3">
          {properties.slice(0, 6).map((property) => (
            <article key={property.id} className="group space-y-5">
              <div className="relative h-80 overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-sky-100 to-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                {property.coverImageUrl ? <Image src={property.coverImageUrl} alt={property.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized /> : null}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-950">{property.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{property.locationLabel}</p>
                <p className="mt-4 text-base font-medium text-slate-950">{property.currencyCode} {property.priceAmount?.toLocaleString("es-MX") ?? "Consultar"}</p>
                <Link href={`/w/${workspaceSlug}/properties/${property.slug}`} className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
                  Ver propiedad
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        <PublicLegalDisclaimer />
      </footer>
    </main>
  );
}
